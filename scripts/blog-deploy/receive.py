#!/usr/bin/python3
"""Receive one static release through a restricted SSH key."""
import fcntl
import os
from pathlib import Path
import re
import shutil
import sys
import tarfile
import tempfile
from urllib.request import urlopen


def publish(root, revision, preview_url):
    current = root / "current"
    releases = root / "releases"
    releases.mkdir(exist_ok=True)
    with (root / "publish.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        previous = current.readlink() if current.is_symlink() else None
        with tempfile.TemporaryDirectory(dir=releases) as staging:
            staging = Path(staging)
            with tarfile.open(fileobj=sys.stdin.buffer, mode="r|gz") as archive:
                for member in archive:
                    if not (member.isdir() or member.isfile()):
                        raise ValueError(f"Unsupported archive entry: {member.name}")
                    archive.extract(member, staging, filter="data")

            blog = staging / "dist"
            for name in ("index.html", "pagefind/pagefind.js"):
                if not (blog / name).is_file():
                    raise ValueError(f"Missing build output: {name}")
            (blog / "deployment-revision.txt").write_text(revision + "\n")

            release = Path(tempfile.mkdtemp(prefix=f"{revision}-", dir=releases))
            release.chmod(0o755)
            blog.chmod(0o755)
            blog.rename(release / "blog")

            def switch(target):
                pending = staging / "next"
                pending.symlink_to(target)
                pending.replace(current)

            switch(release)
            try:
                with urlopen(f"{preview_url}/deployment-revision.txt", timeout=10) as response:
                    if response.read().decode().strip() != revision:
                        raise RuntimeError("The server did not return the new revision")
                with urlopen(f"{preview_url}/pagefind/pagefind.js", timeout=10) as response:
                    if not response.read(1):
                        raise RuntimeError("The search script is empty")
            except BaseException:
                if previous is None:
                    current.unlink()
                else:
                    switch(previous)
                shutil.rmtree(release)
                raise
            print(f"Published {revision}")


if __name__ == "__main__":
    command = os.environ.get("SSH_ORIGINAL_COMMAND", "")
    match = re.fullmatch(r"publish ([0-9a-f]{40})", command)
    if not match:
        sys.exit("Expected publish followed by a full Git revision")
    publish(Path("/srv/blog"), match[1], "http://127.0.0.1:8089/blog")
