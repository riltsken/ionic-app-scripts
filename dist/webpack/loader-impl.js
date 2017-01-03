"use strict";
var path_1 = require('path');
var helpers_1 = require('../util/helpers');
var logger_1 = require('../logger/logger');
function webpackLoader(source, map, webpackContex) {
    webpackContex.cacheable();
    var callback = webpackContex.async();
    var context = helpers_1.getContext();
    var absolutePath = path_1.resolve(path_1.normalize(webpackContex.resourcePath));
    logger_1.Logger.debug("[Webpack] loader: processing the following file: " + absolutePath);
    var javascriptPath = helpers_1.changeExtension(absolutePath, '.js');
    var sourceMapPath = javascriptPath + '.map';
    var javascriptFile = null;
    var mapFile = null;
    var promises = [];
    var readJavascriptFilePromise = readFile(context.fileCache, javascriptPath);
    promises.push(readJavascriptFilePromise);
    readJavascriptFilePromise.then(function (file) {
        javascriptFile = file;
    });
    var readJavascriptMapFilePromise = readFile(context.fileCache, sourceMapPath);
    promises.push(readJavascriptMapFilePromise);
    readJavascriptMapFilePromise.then(function (file) {
        mapFile = file;
    });
    Promise.all(promises).then(function () {
        var sourceMapObject = map;
        if (mapFile) {
            try {
                sourceMapObject = JSON.parse(mapFile.content);
            }
            catch (ex) {
                logger_1.Logger.debug("[Webpack] loader: Attempted to parse the JSON sourcemap for " + mapFile.path + " and failed -\n          using the original, webpack provided source map");
            }
            sourceMapObject.sources = [absolutePath];
            if (!sourceMapObject.sourcesContent || sourceMapObject.sourcesContent.length === 0) {
                sourceMapObject.sourcesContent = [source];
            }
        }
        callback(null, javascriptFile.content, sourceMapObject);
    }).catch(function (err) {
        logger_1.Logger.debug("[Webpack] loader: Encountered an unexpected error: " + err.message);
        callback(err);
    });
}
exports.webpackLoader = webpackLoader;
function readFile(fileCache, filePath) {
    var file = fileCache.get(filePath);
    if (file) {
        logger_1.Logger.debug("[Webpack] loader: Found " + filePath + " in file cache");
        return Promise.resolve(file);
    }
    logger_1.Logger.debug("[Webpack] loader: File " + filePath + " not found in file cache - falling back to disk");
    return helpers_1.readFileAsync(filePath).then(function (fileContent) {
        logger_1.Logger.debug("[Webpack] loader: Loaded " + filePath + " successfully from disk");
        var file = { path: filePath, content: fileContent };
        fileCache.set(filePath, file);
        return file;
    }).catch(function (err) {
        logger_1.Logger.debug("[Webpack] loader: Failed to load " + filePath + " from disk");
        throw err;
    });
}
