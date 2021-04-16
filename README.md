# purgecss

- 功能：剔除掉没有用到的 css

## 基本原理

### 1. purge

```javascript
public async purge(
  userOptions: UserDefinedOptions | string | undefined
): Promise<ResultPurge[]> {
  const { content, css, extractors, safelist } = this.options;

  // 1. 过滤出文件内容
  const fileFormatContents = content.filter(
    (o) => typeof o === "string"
  ) as string[];

  // 2. 获取每种文件类型的“选择器”，用于提取使用到的样式
  const cssFileSelectors = await this.extractSelectorsFromFiles(
    fileFormatContents,
    extractors
  );

  // 3. 提取出被使用的样式
  return this.getPurgedCSS(
    css,
    mergeExtractorSelectors(cssFileSelectors, cssRawSelectors)
  );
}
```

## 2. getPurgedCSS

`this.getPurgedCSS`利用**postcss**生成**css 文件**的**AST**，然后根据用户自定义的**提取器（匹配规则）**清除掉**没有用到的样式**，最终生成**新的 css**，这里面只包含用到的样式。

```javascript
public async getPurgedCSS(
  cssOptions: Array<string | RawCSS>,
  selectors: ExtractorResultSets
): Promise<ResultPurge[]> {
  const sources = [];

  for (const option of processedOptions) {
    // parse 出 AST 树
    const root = postcss.parse(cssContent);

    // 遍历 CSS 的 AST 节点，根据 selectors 信息清除掉无用的样式
    this.walkThroughCSS(root, selectors);

    const result: ResultPurge = {
      // 调用 AST 的 toString() 方法，还原成 CSS 文本
      css: root.toString(),
      file: typeof option === "string" ? option : undefined,
    };

    sources.push(result);
  }

  return sources;
}
```

## 2. 提取器：selectors

**提取器**用于提取出文件中用到的**关键词**，

其中**默认**的提取器是这样

```javascript
defaultExtractor: (content) => content.match(/[A-Za-z0-9_-]+/g) || [],
```

由于这是针对所有文件类型的**关键词**提取，所以它提取出的**关键词**被分类在 `undetermined` 中，这个分类是用来兜底匹配的，无论是 **class 类型**还是 **tag 类型**，只要它的在 `undetermined` 中出现，那么这个 CSS 节点就不会被删除。

整个提取器最终返回的数据类型如下：

```javascript
type ExtractorResultDetailed = {
  attributes: {
    names: string[],
    values: string[],
  },
  classes: string[],
  ids: string[],
  tags: string[],
  undetermined: string[],
};
```

我们可以提供**自定义提取器**，比如提取 **.vue 单文件**、**jsx 文件**，实现对不同文件的**css tree-shaking**
