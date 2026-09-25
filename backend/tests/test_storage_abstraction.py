"""Unit tests for pluggable media storage abstraction."""

import os
from unittest.mock import MagicMock, patch
import pytest

from app.core.storage import (
    BaseMediaStorage,
    LocalMediaStorage,
    S3MediaStorage,
    get_media_storage,
)
from app.core.config import settings


def test_local_media_storage_operations(tmp_path):
    """Test LocalMediaStorage save, list, and delete operations."""
    storage = LocalMediaStorage(base_dir=str(tmp_path))
    content = b"fake-image-bytes"
    filename = "test-image.jpg"

    # Save
    res = storage.save(content, filename, category="projects", content_type="image/jpeg")
    assert res["filename"] == filename
    assert res["category"] == "projects"
    assert res["size"] == len(content)
    assert res["url"] == f"/media/projects/{filename}"

    # Verify physical file
    target_file = tmp_path / "projects" / filename
    assert target_file.exists()
    assert target_file.read_bytes() == content

    # List
    items = storage.list_files(category="projects")
    assert len(items) >= 1
    assert any(i["filename"] == filename for i in items)

    # Delete
    deleted = storage.delete(res["url"])
    assert deleted is True
    assert not target_file.exists()


def test_local_media_storage_path_traversal(tmp_path):
    """Verify that path traversal attempts are blocked."""
    storage = LocalMediaStorage(base_dir=str(tmp_path))
    with pytest.raises(ValueError, match="Path traversal"):
        storage.save(b"test", "../../etc/passwd", category="projects")


def test_s3_media_storage_save_and_delete():
    """Test S3MediaStorage operations with mocked boto3 S3 client."""
    with patch("boto3.client") as mock_boto:
        mock_s3 = MagicMock()
        mock_boto.return_value = mock_s3

        storage = S3MediaStorage(
            bucket_name="test-bucket",
            access_key_id="mock-access-key",
            secret_access_key="mock-secret-key",
            region_name="us-east-1",
            public_url_prefix="https://cdn.nextaura.io",
        )

        content = b"mock-s3-image-data"
        res = storage.save(
            file_bytes=content,
            filename="aurora.webp",
            category="projects",
            content_type="image/webp",
        )

        # Verify put_object was called on mock S3 client
        mock_s3.put_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="projects/aurora.webp",
            Body=content,
            ContentType="image/webp",
        )

        assert res["url"] == "https://cdn.nextaura.io/projects/aurora.webp"
        assert res["filename"] == "aurora.webp"

        # Test delete
        deleted = storage.delete("https://cdn.nextaura.io/projects/aurora.webp")
        assert deleted is True
        mock_s3.delete_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="projects/aurora.webp",
        )


def test_storage_factory_fallback():
    """Verify that factory falls back safely to LocalMediaStorage when credentials are not configured."""
    original_provider = settings.MEDIA_STORAGE_PROVIDER
    try:
        settings.MEDIA_STORAGE_PROVIDER = "s3"
        settings.S3_BUCKET_NAME = None
        storage = get_media_storage()
        assert isinstance(storage, LocalMediaStorage)
    finally:
        settings.MEDIA_STORAGE_PROVIDER = original_provider
