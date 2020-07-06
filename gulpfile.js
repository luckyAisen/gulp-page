/**
 * src 是 gulp 提供的一个读取流api
 * dest 是 gulp 提供的一个写入流api
 * watch 是gulp 提供的一个监听文件变化的api
 * series 是gulp 提供的一个函数组合任务函数，它会按照顺序依次执行任务，可以称为串行任务
 * parallel 是gulp 提供的一个函数组合任务函数，它和series的功能是一样的，但是没有执行循序的限制，可以称为并行任务
 */
const { src, dest, parallel, series, watch } = require("gulp");

const loadPlugins = require("gulp-load-plugins");

const plugins = loadPlugins();

const del = require("del");

const browserSync = require("browser-sync");

const bs = browserSync.create();

/**
 * 清除目录
 */
const clean = () => {
  return del(["temp", "dist"]);
};

/**
 * 处理html
 * 读取src文件夹下的所有的以html结尾的文件，写入到temp文件夹下
 */
const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true })); // 当watch执行这个任务的时候，重新加载这个任务
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
      .pipe(bs.reload({ stream: true })) // 当watch执行这个任务的时候，重新加载这个任务
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
      .pipe(bs.reload({ stream: true })) // 当watch执行这个任务的时候，重新加载这个任务
  );
};

/**
 * 处理图片
 * 读取src目录下的assets目录下的images目录下的所有文件，使用imagemin这个插件进行高保真的压缩,并且写入到temp目录下。
 */
const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

/**
 * 处理图片
 * 读取src目录下的assets目录下的images目录下的所有文件，使用imagemin这个插件进行高保真的压缩,并且写入到temp目录下。
 */
const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

/**
 * 其他文件的处理
 */
const extra = () => {
  return src("public/**", { base: "public" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

/**
 * 创建开发服务器，实现热更新功能。
 */
const serve = () => {
  watch("src/*.html", page); // 监听src目录下的所有html文件，当文件发生变化时，执行page这个任务
  watch("src/assets/styles/*.scss", style); // 监听src目录下的assets目录下的styles目录下的所有scss文件，当文件发生变化时，执行style这个任务
  watch("src/assets/scripts/*.js", script); // 监听src目录下的assets目录下的script目录下的所有scss文件，当文件发生变化时，执行script这个任务
  // 监听src/assets/images、src/assets/fonts、和public目录下的所有内容，执行 bs.reload 这个方法，重新加载
  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );
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

/**
 * 处理打包上线时，代码中一些node_module的文件引用和压缩
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

const compile = parallel(page, style, script);

const develop = series(clean, compile, serve);

const build = series(
  clean,
  parallel(image, font, extra, series(compile, useref))
);

module.exports = {
  clean,
  page,
  style,
  script,
  image,
  font,
  extra,
  serve,
  compile,
  develop,
  useref,
  build,
};
