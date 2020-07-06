# 使用 gulp 进行项目的开发和打包

## 目标

使用 gulp 提供一个在项目的开发过程中需要的服务器，热更新的功能。在项目开发完成后，编译压缩合拼文件，通过命令的方式帮助我们自动完成编译构建。

## 说明

文档中使用到的模板是这个：[aisen60-pages](https://github.com/Aisen60/aisen60-pages)

## gulp 是什么？

引用官网的一句话**gulp 将开发流程中让人痛苦或耗时的任务自动化，从而减少你所浪费的时间、创造更大价值。**，gulp 是一个自动化的工具，它可以帮助我们完成很多耗时重复的任务，例如：编译、打包、压缩等等。gulp 本身不具备任务的打包编译压缩的功能，它只是一个任务工具，我们可以通过插件，编写任务的方式实现我们想要的想要自动化构建的内容。

## 准备工作

### 安装 gulp

克隆或者下载模板到本地，执行`yarn install`安装项目所需要的依赖。安装完依赖后，我们来安装 gulp。输入`yarn add gulp --dev`，就能完成 gulp 的安装。安装完成后，我们需要在根目录下新建一个**gulpfile.js**的文件，这个文件是 gulp 的入口文件。我们所有的任务都在这个文件进行编写。我们需要通过`module.exports`的方式导出任务。代码如下：

```javaScript
module.exports = {
  clean,
};
```

**在 gulp 中，可以理解为，一个任务就是一个函数，或者一个任务是由多个任务组合成函数的。**

### 安装 gulp-load-plugins

安装完 gulp 过后，我们来安装一个`gulp-load-plugins`这个插件，这个插件就是帮我们去自动加载所有的插件的，这样的话，就不需要一个一个引入了。我们在命令行终端输入`yarn add gulp-load-plugins --dev`来安装这个插件。

安装完成后，我们在 gulpfile.js 中引入，并且调用它。

```javaScript
const loadPlugins = require("gulp-load-plugins");

const plugins = loadPlugins();
```

### 项目中会用到的 gulp 的 api

接着，我们来看看 gulp 中几个常用的 api。点击进入[官方文档](https://www.gulpjs.com.cn/docs/api/)

- `src` 是 gulp 提供的一个读取流 api
- `dest` 是 gulp 提供的一个写入流 api
- `watch` 是一个 gulp 提供的一个监听文件变化的 api
- `series`是 gulp 提供的一个函数组合任务函数，它会按照顺序依次执行任务，可以称为串行任务
- `parallel` 是 gulp 提供的一个函数组合任务函数，它和 series 的功能是一样的，但是没有执行循序的限制，可以称为并行任务

以上这几个 api，会经常用到。

## 编写基础任务

准备工作完成后，我们来编写基础任务。编写基础任务，主要是处理这几个方面的内容：
html 的处理、scss 文件的处理，es6 的编译，以及图片文件、字体和一些其他文件的处理。

这些基础任务，在后面的开发服务器和打包压缩都会使用到。

### 清除任务的编写

因为在开发服务器以及最后的打包构建环节，会经常对文件夹进行删除操作，一般我们编译上线都是 `dist` 目录。我们在开发服务器时，会监听一个 `temp` 目录。所以这里，我们会写一个清除任务，对 `dist` 和 `temp` 这两个文件夹进行删除操作。

那，完成这个删除操作，需要安装一个`del`的包。我们在命令行输入 `yarn add del --dev` 来完成安装。安装完成后，我们在 gulpfile.js 中引入 `del` 这个包，并且编写清除任务。代码如下：

```javaScript
const del = require("del");

/**
 * 清除目录
 */
const clean = () => {
  return del(["temp", "dist"]);
};

module.exports = {
  clean,
};
```

编写完任务后，我们在根目录下手动新建一个 dist 目录和 temp 目录。然后在命令行终端输入：`yarn gulp clean`,输入完命令后，我们可以看到，终端会输出一些信息（开始任务，结束任务，耗时，完成等情况），在看看根目录下，dist 和 temp 文件夹已经被删除了。

我们的第一个基础的任务就已经编写完成了。

### 处理 html

因为后面我们需要去启动一个服务器渲染我们的页面，一般情况下，我们会监听一个叫做 temp 为文件夹，这个 temp 文件夹就是服务器所需要渲染和加载的内容。

我们先处理 html 的内容，我们打开到 index.html 这个文件，我们观察一下这个 index.html 引入了 main.css、 main.js 和 node_module 中的 bootstrap.css、jquery.js、popper.js、bootstrap.js。这些我们都暂时先不管，后面会有专门的处理。

现在要做的内容就是，将 src 下的 index.html 和 about.html 拷贝到 temp 文件夹下。

我们来编写代码：

```JavaScript
/**
 * 处理html
 * 读取src文件夹下的所有的以html结尾的文件，写入到temp文件夹下
 */
const page = () => {
  return src("src/*.html", { base: "src" }).pipe(dest("temp"));
};
```

**这段代码的意思是，使用 gulp 提供的 src 这个 api，去读取 src 文件夹下的所有的以 html 结尾的文件，使用 gulp 提供的 dest 这个 api 写入到 temp 文件夹下。**

我们需要把 page 这个函数导出，导出过后，我们在命令行终端输入`yarn gulp page` 。输入过后，我们会看到，根目录下会多出一个 temp 文件夹，我们打开 temp 文件夹会看到里面有一个 index.html 和 about.html 文件，这两个文件的内容都是和 src 下的内容是一致的。

### 处理 scss

那接下来，我们来处理 temp 文件夹下 index.html 和 about.html 中的 main.css。我们在 src 文件夹下找到 main.scss 文件，因为浏览器是识别不了 scss 文件的，我们需要将 scss 编译成 css，供浏览器使用。我们需要将 main.scss 编译成 main.css 然后按照指定目录层级的关系，写入到 temp 目录中。

在这个过程中，要使用到一个插件，叫做 `gulp-sass`。在命令行终端输入 `yarn add gulp-sass --dev`，安装完成过后，我们来编写以下处理 scss 这个任务，代码如下：

```JavaScript
/**
 * scss文件的处理
 * 读取src目录下的assets目录下的styles目录下的所有的以scss结尾的文件，使用sass这个插件把scss编译成css,并且写入到temp目录下。
 */
const style = () => {
  return (
    src("src/assets/styles/*.scss")
      // 因为使用了sass，需要安装gulp-sass这个插件处理sass，
      /**
       * 参数说明：
       * outputStyle 输出的样式风格。
       * 有以下几种方式：
       * 嵌套输出方式 nested
       * 展开输出方式 expanded
       * 紧凑输出方式 compact
       * 压缩输出方式 compressed
       */
      .pipe(plugins.sass({ outputStyle: "expanded" }))
      .pipe(dest("temp"))
  );
};
```

编写完后，我们还需要将 style 导出出去，方便我们校验测试。接着，我们在命令行终端输入 `yarn gulp style` 这个命令。完了之后，我们观察一下 temp 目录下会多出一个 main.css 文件。我们打开这个 main.css 文件，我们看到这里面的内容已经是 css 的内容了。

**这时你或许有疑问了 🤔🤔🤔**

**为什么 src 目录的 style 目录有三个.scss 文件，而编译后的只有一个 main.css？**

**为什么写入 temp 目录时，没有和 src 目录下一样的结构？**

那，针对第一个问题呢，其实原因很简单，我们打开到 src 下的 main.scc,我们可以看到引入了\_icons.scss 和 \_variables.scss，而一般，文件名以下划线开头的都是引用文件。在编译的时候，会把内容写入到一起

第二个问题呢，解决的方法就是，在 src 这个 api 设置一个 base 的基本路径，设置成'src'就能解决这个问题。代码如下：

```diff
/**
 * scss文件的处理
 * 读取src目录下的assets目录下的styles目录下的所有的以scss结尾的文件，使用sass这个插件把scss编译成css,并且写入到temp目录下。
 */
const style = () => {
  return (
-    src("src/assets/styles/*.scss")
+    src("src/assets/styles/*.scss", { base: "src" })
      // 因为使用了sass，需要安装gulp-sass这个插件处理sass，
      /**
       * 参数说明：
       * outputStyle 输出的样式风格。
       * 有以下几种方式：
       * 嵌套输出方式 nested
       * 展开输出方式 expanded
       * 紧凑输出方式 compact
       * 压缩输出方式 compressed
       */
      .pipe(plugins.sass({ outputStyle: "expanded" }))
      .pipe(dest("temp"))
  );
};
```

我们重新执行一下 `yarn gulp style` 这个任务，可以看到，temp 目录下生成的 main.css 已经是按照和 src 目录下一模一样的层级结构了。

### js 的处理

接下来，我们继续来处理 js，我们打开 src 下的 main.js，我们能看到使用了 es6 定义变量的关键词，在现代浏览器中，大部分的浏览器对 es6 的兼容比较差，我们需要借助 babel 将 es6 以及以上的版本进行编译，转换成浏览器可使用的 es5 代码等。

接下来，我们需要安装`gulp-babel`、`@babel/core`、`@babel/preset-env` 这三个插件。我们在命令行输入`yarn add gulp-babel @babel/core @babel/preset-env --dev`。安装完成后，我们来编写任务，代码如下：

```JavaScript
/**
 * js文件的处理
 * 读取src目录下的assets目录下的scripts目录下的所有的以js结尾的文件，使用babel这个插件并且使用"@babel/preset-env"这个规则，
 * 把代码中es6及以上版本的新特性，编译成es5,并且写入到temp目录下。
 */
const script = () => {
  return (
    src("src/assets/scripts/*.js", { base: "src" })
      // 需要安装babel对js进行处理，需要安装gulp-babel @babel/core @babel/preset-env 这3个插件
      .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
      .pipe(dest("temp"))
  );
};
```

编写完代码后，我们要把 script 导出，方便我们校验测试。

接着，我在浏览器控制台，输入 `yarn gulp script` 来执行这个任务，**执行完后，我们看到 temp 目录下的 assets 目录下的 scripts 目录，里面有一个 main.js 文件，证明，我们输出写入的层级关系和 src 目录下是一致的。我们打开 temp 目录下的 main.js 文件，可以看到原 src 目录下的 main.js 所使用的 `const` 变量关键字，已经修改成了浏览器可识别的 `var`**

编写完对 html、css、js 文件的处理后，我们还需要编写三个任务，这三个任务分别是图片文件的处理、字体文件的处理、还有其他文件的处理。这三个任务在启动一个服务器时不会用到，但是我们在最后的打包编译时会用得到。

### 图片文件的处理

接着，我们来处理一下图片文件。会使用到一个插件叫做`gulp-imagemin`，这个插件的主要作用就是帮助我们高保真的压缩图片或者文件。它是不会损坏原文件或者原图片的，它会在保持原文件或者原图片的情况下，尽可能的压缩文件的大小。

我们在终端输入`yarn add gulp-imagemin --dev` 来安装一下这个插件。PS:这个插件使用 yarn 会非常慢，因为要去下载一些二进制的东西。所以我这里用了 cnpm 去安装。安装完了之后，我们开始编写任务，代码如下：

```JavaScript
/**
 * 处理图片
 * 读取src目录下的assets目录下的images目录下的所有文件，使用imagemin这个插件进行高保真的压缩,并且写入到dist目录下。
 */
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
```

编写完代码后，我们要把 image 导出，方便我们校验测试。我们在终端输入 `yarn gulp image` 来执行以下这个任务，需要花的时间可能会比较久。压缩完成过后，我们看到 temp 目录下的 assets 目录下已经有 src 目录下的那张图片了。为了校验是否有压缩成功，我们首先查看 src 目录下的 logo.png 文件的大小是**545KB**,在看到 dist 目录下的 logo.png 文件的大小是**312KB**。那就证明是压缩了的。

### 字体文件的处理

同样的，字体文件的处理也可以使用 imagemin 这个插件来处理，代码如下：

```javaScript
/**
 * 处理图片
 * 读取src目录下的assets目录下的fonts目录下的所有文件，使用imagemin这个插件进行高保真的压缩,并且写入到dist目录下。
 */
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
```

编写完代码后，我们要把 font 导出，方便我们校验测试。我们在终端输入 `yarn gulp font` 来执行以下这个任务。任务执行成功后，我们可以比较 src 下的 fonts 下的文件大小与 dist 下的 fonts 下的文件大小的差异。

### 其他文件的处理

我们在编写一个任务，这个任务是去处理一些其他文件的，比如说网站的 ico 图标等等，同样的，我们也可以使用
imagemin 这个插件，代码如下：

```javaScript
/**
 * 其他文件的处理
 */
const extra = () => {
  return src("public/**", { base: "public" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};
```

编写完代码后，我们要把 extra 导出，方便我们校验测试。我们在终端输入 `yarn gulp extra` 来执行以下这个任务。任务执行成功后，我们可以看到 dist 目录下多了 favicon.ico 这个文件。

### image、font、extra 任务的其他说明

为什么我要把 image、font、extra 这三个任务写入到 dist 目录呢？因为这三个任务都是比较耗时的，在开发阶段中没有必要把这三个耗时的任务也一起处理了。那关于 temp 目录要如何引用这图片、字体以及 ico 呢？下面的开发服务器会有讲解。

## 启动一个服务器

### 安装 grunt-browser-sync 插件

接下里，我们来实现，启动一个服务器，并且实现热更新的功能。要想启动一个服务器，我们还需要借助一个插件，叫做`browser-sync`，我们来安装一下这个插件。命令行输入`yarn add browser-sync --dev`。安装完成过后，我们需要在 gulpfile.js 中引入这个插件，并且调用这个插件的`create`方法来创建一个实例。代码如下：

```JavaScript
const browserSync = require("browser-sync");
const bs = browserSync.create();
```

接下来，我们来编写任务，代码如下：

```JavaScript
/**
 * 创建开发服务器，实现热更新功能。
 */
const serve = () => {
  bs.init({
    notify: false, //是否通知
    port: 6060, //启动的端口，默认3000端口
    server: {
      baseDir: ["temp"],
    },
  });
};
```

这段代码的意思是，通过 browser-sync 中 init 这个方法来创建一个服务器。参数的讲解

- notify 是否开启通知，
- port 启动的端口，默认 3000 端口。
- server
  - baseDir 是监听的目录。

写完任务后，我们先把 serve 导出出去。但是这里会有一个问题，在执行这个任务之前我们要处理根目录下没有 temp 目录的情况。那我们想想，temp 目录下存放的是什么？是不是存放的我们前面写的 page、style、script 这几个任务所生成文件。

所以我们在执行 serve 这个任务之前，我们要重新执行 page、style、script 这个几个任务。那我们肯定不想一个一个任务手动执行，我们可以使用 gulp 提供的一个 api，叫做`parallel`,它的作用是，将几个任务串联在一起执行，没有顺序之分。代码如下：

```diff
- const { src, dest } = require("gulp");
+ const { src, dest, parallel } = require("gulp");
```

```JavaScript
const compile = parallel(page, style, script);
```

编写完这个 `compile` 任务后，我们要把 `compile` 导出,方便我们校验测试。我们先手动把根目录下 temp 目录删除，接着我们在终端输入`yarn gulp compile` 执行完后，我们可以看到根目录下重新生成了 temp 目录，temp 目录下有 `page, style, script` 这三个任务所输出的文件。

接着，我们在命令终端输入 `yarn gulp serve` 这个命令，系统会自动帮我们打开一个浏览器，并且是 6060 端口的。

我们先来看看有什么效果，效果如下：

<img  alt="https://user-images.githubusercontent.com/19791710/86598686-0ec33b80-bfd0-11ea-8ab3-412734a1a12a.png" src="https://user-images.githubusercontent.com/19791710/86598686-0ec33b80-bfd0-11ea-8ab3-412734a1a12a.png">

我们看到页面的样式完全是乱的。为了解决这个问题，我们打开到 temp 目录下的 index.html 文件，我们发现 index.html 中 head 标签中使用了一个 node_module 的 bootstrap.css。而我们的服务器是监听 temp 目录的，我们 temp 目录下并没有 node_module 这个文件夹。那要如何解决这个问题，难道要把 node_module 拷贝到 temp 目录下嘛？这样有点不现实。

为了解决这个问题，我们可以在 bs.init 中加入一个配置，叫做 `routes`，路由映射，它会优先去我们指定的目录查找文件，代码如下：

```diff
/**
 * 创建开发服务器，实现热更新功能。
 */
const serve = () => {
  bs.init({
    notify: false, //是否通知
    port: 6060, //启动的端口，默认3000端口
    server: {
      baseDir: ["temp"],
+       routes: {
+         // 前置路由，设置了路由后，会去找项目目录中指定的文件夹
+         "/node_modules": "node_modules",
+       },
    },
  });
};
```

添加了之后，我们重新运行 `yarn gulp serve` ，我们可以看到现在页面样式已经是正常的了。

效果如下：

<img alt="https://user-images.githubusercontent.com/19791710/86600345-84c8a200-bfd2-11ea-9a51-c77903271272.png" src="https://user-images.githubusercontent.com/19791710/86600345-84c8a200-bfd2-11ea-9a51-c77903271272.png">

我们打开 F12，切换到 Network 选择 CSS，我们可以看到已经 bootstrap.css 已经是加载成功了。在选择到 JS，我们也可以看到 bootstrap.js、jquery.js、popper.js 都是已经加载进来了。

接下来，我们随便点点页面上的按钮看看，我们点导航中的 About 按钮，进入到 about.html 页面，我们发现 logo 没有加载出来，效果图如下：

<img alt="https://user-images.githubusercontent.com/19791710/86603991-5dc09f00-bfd7-11ea-803c-2c03a394e4b0.png" src="https://user-images.githubusercontent.com/19791710/86603991-5dc09f00-bfd7-11ea-803c-2c03a394e4b0.png">

我们打开 F12，找到这个图片元素，我们发现，它引用的是当前目录下的 assets 目录下的 images 目录下 logo.png，可是我们的 temp 目录下没有啊。前面说过了，我们在开发阶段不需要把图片字体和其他文件一起打包到 temp 目录下，我们可以通过监听多个目录的方式来解决这个问题。代码如下：

```diff
/**
 * 创建开发服务器，实现热更新功能。
 */
const serve = () => {
  bs.init({
    notify: false, //是否通知
    port: 6060, //启动的端口，默认3000端口
    server: {
-      baseDir: ["temp"],
+      baseDir: ["temp", "src", "public"], // 监听多个目录
      routes: {
        // 前置路由，设置了路由后，会去找项目目录中指定的文件夹
        "/node_modules": "node_modules",
      },
    },
  });
};
```

我们重新执行一下 `yarn gulp serve`，在重新进入 about 页面，我们看到，图片 logo 已经加载进来了。

### 简化步骤

接下来，我们观察一下，难道启动一个服务器把项目跑起来要手动删除 temp 目录并且执行两条任务嘛？我们能不能编写一个任务，先去执行 `clean` 任务，接着执行 `compile` 最后再去执行 `serve` 任务。

当然是可以的了，我们可以使用 gulp 提供中的一个 api 叫做`series`，它是一个函数组合任务函数，它和 parallel 一样可以一次执行多个任务，但是，它会按照顺序依次执行任务，可以称为串行任务。

代码如下：

```diff
- const { src, dest, parallel } = require("gulp");
+ const { src, dest, parallel, series } = require("gulp");
```

```JavaScript
const develop = series(clean, compile, serve);
```

编写完后，我们需要把 `develop` 导出出去，方便我们校验调试。

我们在命令行终端输入 `yarn gulp develop` ，执行完任务后，系统会帮我们打开一个浏览器，我们随点点点、看看页面的内容展示是否完善。

这样就完成了服务器的启动。

### 实现热更新

我们需要使用到 gulp 提供的一个 api 叫做 `watch` 搭配 `browser-sync` 一起使用来实现热更新。

我们需要引入 `watch`，代码如下：

```diff
- const { src, dest, parallel, series } = require("gulp");
+ const { src, dest, parallel, series, watch } = require("gulp");
```

接着，我们修改一下 `serve` 任务，代码如下：

```diff
/**
 * 创建开发服务器，实现热更新功能。
 */
const serve = () => {
+ watch("src/*.html", page); // 监听src目录下的所有html文件，当文件发生变化时，执行page这个任务
+ watch("src/assets/styles/*.scss", style); // 监听src目录下的assets目录下的styles目录下的所有scss文件，当文件发生变化时，执行style这个任务
+ watch("src/assets/scripts/*.js", script); // 监听src目录下的assets目录下的script目录下的所有scss文件，当文件发生变化时，执行script这个任务
+ // 监听src/assets/images、src/assets/fonts、和public目录下的所有内容，执行 bs.reload 这个方法，重新加载
+ watch(
+   ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
+   bs.reload
+ );
  bs.init({
    notify: false, //是否通知
    port: 6060, //启动的端口，默认3000端口
    server: {
      baseDir: ["temp", "src", "public"], // 监听多个目录
      routes: {
        // 前置路由，设置了路由后，会去找项目目录中指定的文件夹
        "/node_modules": "node_modules",
      },
    },
  });
};
```

在接着，我们还要修改 `page, style, script` 这三个任务，代码如下：

```diff
/**
 * 处理html
 * 读取src文件夹下的所有的以html结尾的文件，写入到temp文件夹下
 */
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(dest("temp"))
+   .pipe(bs.reload({ stream: true }));// 当watch执行这个任务的时候，重新加载这个任务
};

/**
 * scss文件的处理
 * 读取src目录下的assets目录下的styles目录下的所有的以scss结尾的文件，使用sass这个插件把scss编译成css,并且写入到temp目录下。
 */
const style = () => {
  return (
    src("src/assets/styles/*.scss", { base: "src" })
      // 因为使用了sass，需要安装gulp-sass这个插件处理sass，
      /**
       * 参数说明：
       * outputStyle 输出的样式风格。
       * 有以下几种方式：
       * 嵌套输出方式 nested
       * 展开输出方式 expanded
       * 紧凑输出方式 compact
       * 压缩输出方式 compressed
       */
      .pipe(plugins.sass({ outputStyle: "expanded" }))
      .pipe(dest("temp"))
+     .pipe(bs.reload({ stream: true }));// 当watch执行这个任务的时候，重新加载这个任务
  );
};

/**
 * js文件的处理
 * 读取src目录下的assets目录下的scripts目录下的所有的以js结尾的文件，使用babel这个插件并且使用"@babel/preset-env"这个规则，
 * 把代码中es6及以上版本的新特性，编译成es5,并且写入到temp目录下。
 */
const script = () => {
  return (
    src("src/assets/scripts/*.js", { base: "src" })
      // 需要安装babel对js进行处理，需要安装gulp-babel @babel/core @babel/preset-env 这3个插件
      .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
      .pipe(dest("temp"))
+     .pipe(bs.reload({ stream: true }))// 当watch执行这个任务的时候，重新加载这个任务
  );
};
```

**修改的这几段代码的意思是，在`serve`这个任务中去监听这些文件，并且执行相关的任务和重新加载**

- src/\*.html
- src/assets/styles/\*.scss
- src/assets/scripts/\*.js
- src/assets/images/\*\*
- src/assets/fonts/\*\*
- public/\*\*

修改完后，我们重新执行 `yarn gulp develop` 这个任务，当浏览器启动完成后，我们修改首页 banner 这个样式，就是修改 src 下的\_variables.scss 文件，我们修改`$jumbotron-bg`这个变量，我们改成红色（#f00），修改完成后，我们保存，切换回浏览器，我们可以看到页面时时时更新的，效果如下：

<img  alt="https://user-images.githubusercontent.com/19791710/86609587-b21b4d00-bfde-11ea-9f2d-43f54fd7b31d.png" src="https://user-images.githubusercontent.com/19791710/86609587-b21b4d00-bfde-11ea-9f2d-43f54fd7b31d.png">

至此，我们热更新已经做完了。

## 上线时的处理

### 使用 useref

我们在打包上线时，需要借助一个插件来帮我处理代码中一些 node_module 的文件引用、合拼和压缩，叫做`gulp-useref`，同时我们需要安装 `gulp-htmlmin` 这个插件来帮助我们压缩 html 代码、`gulp-clean-css` 这个插件来帮助我们压缩 css 代码、`gulp-uglify` 这个插件来帮助我们压缩 js 代码。还要安装一个插件，`gulp-if` 我们可以通过这个插件来判断是什么类型的文件，去执行相对应的处理。

我们在终端输入安装命令，`yarn add gulp-useref gulp-if gulp-htmlmin gulp-clean-css gulp-uglify --dev` ps：用 yarn 安装好像会比较慢，又要去下载二进制的东西，我这里用了 cnpm 安装。

安装完成后，我们来编写任务，代码如下：

```JavaScript
/**
 * 处理打包上线时，代码中一些node_module的文件引用、合拼和压缩
 * 需要借助一个叫做 gulp-useref 的插件
 */
const useref = () => {
  /**
   * 这里会有一个问题，因为这里同时对一个目录读取和写入，可能会有冲突，可以通过新建一个目录来存放原本dist文件夹的内容，叫做temp文件夹
   * 再接着，通过读取temp文件夹的内容，写入到dis文件夹中就不会有问题。
   */
  return (
    src("temp/*.html", { base: "temp" })
      .pipe(plugins.useref({ searchPath: ["temp", "."] }))
      // 这里对html,css,js文件进行压缩操作
      // 因为这里需要同时处理html,css,js文件，需要安装一个叫做 gulp-if 的插件来判断是什么文件
      // 同理也要安装一些压缩的插件，html->gulp-htmlmin css->gulp-clean-css js->gulp-uglify
      .pipe(
        plugins.if(
          // 使用gulp-if这个插件判断是什么类型的文件，如果是html文件，执行htmlmin这个插件
          /\.html$/,
          plugins.htmlmin({
            collapseWhitespace: true, // 压缩一行不留空格
            minifyCSS: true, // css也是压缩成一行
            minifyJS: true, // js也是压缩成一行
          })
        )
      )
      .pipe(plugins.if(/\.css$/, plugins.cleanCss())) // 使用gulp-if这个插件判断是什么类型的文件，如果是html文件，执行cleanCss这个插件
      .pipe(plugins.if(/\.js$/, plugins.uglify())) // 使用gulp-if这个插件判断是什么类型的文件，如果是html文件，执行uglify这个插件
      .pipe(dest("dist")) // 将处理完过后的内容，全部输入到
  );
};
```

编写完后，我们需要将 useref 这个任务导出，方便我们校验调试。我们在命令行终端，输入 `yarn gulp useref` 稍等一会，等任务执行结束后，我们看到 dist 目录下的已经生成了和 temp 目录下的内容是一致的了，我们打开 index.html 这个文件，我们发现已经被压缩成一行了，我们在看看 css 和 js 文件，都已经是被压缩成一行了。

我们打开 dist 文件夹下的 index.html，通过编辑器将代码格式化。再接着我们打开 temp 目录下的 index.html，我们来对比一下这两个文件。

我们发现，temp 文件夹下的 index.html 中 head 标签是这样的

![image](https://user-images.githubusercontent.com/19791710/86614216-3e307300-bfe5-11ea-82a5-cf05aa1aa3a1.png)

而，dist 文件夹下的 index.html 中 head 标签是这样的，

![image](https://user-images.githubusercontent.com/19791710/86614105-16410f80-bfe5-11ea-802c-9145fddcc8be.png)

然后，我们在看看 temp 文件夹下的 index.html 中 body 最后的内容，是这样子的

![image](https://user-images.githubusercontent.com/19791710/86614427-90719400-bfe5-11ea-9205-bafcc6b59816.png)

而，dist 文件夹下的 index.html 中 body 最后的内容，是这样子的

![image](https://user-images.githubusercontent.com/19791710/86614403-8485d200-bfe5-11ea-8b17-86fd20bfe131.png)

**我们会得出一个结论，`useref` 这个插件，会自动帮我们把 以 `build` 开头，以 `endbuild` 结尾 中间的内容，合拼成一个文件**

PS:这一段是精髓哈哈哈哈~

我们再去看看 dist 目录下的 `vendor.js` 这个文件，我们可以发现，`useref` 会帮我们把 `node_module` 中使用到 js 文件都合拼在一起了。

### 简化步骤

好了，我们校验完 `useref` 这个任务后，我们在处理一下 dist 目录中的图片、字体、以及 ico 文件。我们可以看到 dist 目录下是少了 fonts 目录和 images 目录的。我们需要执行`useref`任务的时候，把图片、字体还有 ico 也一起处理下。我们可以多定义一个任务，叫做`build`,来帮我们一步到位。代码如下：

```JavaScript
const build = series(
  clean,
  parallel(image, font, extra, series(compile, useref))
);
```

这段代码的意思是，使用 `series` 定义一个组合任务，会按照顺序执行指定的任务。会先执行 `clean` 这个清除任务，再接着，执行一个由`parallel`组合串行任务，分别是`image`, `font`, `extra`，最后还有一个并行任务，先去执行`compile` 这个任务，接着再去执行`useref`。

编写完后，我们需要把 `build` 这个任务导出，方便我们校验测试。接着，我们在命令行终端输入`yarn gulp build`,稍等一会，当任务执行完成后，我们看看 dist 文件夹，该有的文件都已经有啦！！！~

### 编写 scripts 脚本

最后一步啦！！！！

加油 💪，把它看完啦！！！！

我们来把 gulpfile.js 中的导出的任务整理一下，其实我们只需要用到这三个任务，分别是 `clean` 、 `develop` 、 `build`。我们把其他的任务都删除，只保留这三个任务就好啦。代码如下：

```diff
module.exports = {
  clean,
-  page,
-  style,
-  script,
-  image,
-  font,
-  extra,
-  serve,
-  compile,
  develop,
-  useref,
  build,
};
```

你有没有发现啊，每次我们打包，或者启动项目的时候，总是要输入这样的命令，例如：`yarn gulp xxx`。我们可以在`package.json`中的`scripts`脚本中编写几个命令。代码如下:

```diff
+ "scripts": {
+     "clean": "gulp clean",
+     "serve": "gulp develop",
+     "build": "gulp build"
+ }
```

这样，我们就不需要在输入烦人的`yarn gulp xxx`了，我们在终端测试一下，分别输入 `yarn clean` 、`yarn serve` 、`yarn build`。都是能执行成功的，这样会不会高级一点，哈哈哈哈哈~

至此，所有的内容都已经完结了，代码我已经提交到了 github 了，有需要的自己下载，如果有必要我会封装成一个 NPM 包。源码：https://github.com/Aisen60/gulp-page

如果有问题，可以在底下进行评论，我会回复的。
