"""Supabase Storageクライアント"""

from supabase import Client, create_client

from app.core.config import settings


def get_supabase_client() -> Client:
    """Supabaseクライアントを取得"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


class StorageService:
    """ストレージサービス"""

    def __init__(self) -> None:
        self.client = get_supabase_client()

    async def upload_file(
        self, bucket: str, path: str, file_data: bytes, content_type: str
    ) -> str:
        """
        ファイルをアップロード

        Args:
            bucket: バケット名
            path: ファイルパス
            file_data: ファイルデータ
            content_type: Content-Type

        Returns:
            アップロードされたファイルのパブリックURL
        """
        # ファイルをアップロード
        self.client.storage.from_(bucket).upload(
            path=path,
            file=file_data,
            file_options={"content-type": content_type},
        )

        # パブリックURLを取得
        public_url = self.client.storage.from_(bucket).get_public_url(path)
        return public_url

    async def delete_file(self, bucket: str, path: str) -> None:
        """
        ファイルを削除

        Args:
            bucket: バケット名
            path: ファイルパス
        """
        self.client.storage.from_(bucket).remove([path])

    async def list_files(self, bucket: str, folder: str = "") -> list[dict]:
        """
        フォルダ内のファイル一覧を取得

        Args:
            bucket: バケット名
            folder: フォルダパス

        Returns:
            ファイル情報のリスト
        """
        result = self.client.storage.from_(bucket).list(folder)
        return result
