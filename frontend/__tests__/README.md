# フロントエンドテストガイド

このディレクトリには、フロントエンドコンポーネントとストアのテストファイルが含まれています。

## 現在の状態

現在、テストファイルは**例示用のプレースホルダー**として作成されています。実際にテストを実行するには、以下のセットアップが必要です。

## テスト環境のセットアップ

### 1. 必要なパッケージのインストール

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @types/jest
```

### 2. Jest設定ファイルの作成

`frontend/jest.config.js` を作成：

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

### 3. jest.setup.jsの作成

`frontend/jest.setup.js` を作成：

```javascript
import '@testing-library/jest-dom'
```

### 4. package.jsonにテストスクリプトを追加

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## テストの実行

セットアップ完了後、以下のコマンドでテストを実行できます：

```bash
# すべてのテストを実行
npm test

# ウォッチモードで実行
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
```

## テストの書き方

### コンポーネントテストの例

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Zustandストアテストの例

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from '@/lib/stores/myStore';

describe('myStore', () => {
  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

## テスト対象

### コンポーネント (`__tests__/components/`)
- BarCard
- BarList
- ReviewCard
- ReviewForm
- FavoriteButton
- Header
- LoginForm
- SignupForm

### ストア (`__tests__/stores/`)
- authStore
- barStore

### ユーティリティ (`__tests__/lib/`)
- api.ts
- auth.ts
- hooks.ts

## ベストプラクティス

1. **各コンポーネントに対して最低1つのテストを作成**
2. **エッジケースをテスト**（空のデータ、エラー状態など）
3. **ユーザー操作をテスト**（クリック、入力など）
4. **アクセシビリティをテスト**
5. **モックを適切に使用**（API呼び出し、外部依存関係）

## 参考リンク

- [Jest公式ドキュメント](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
