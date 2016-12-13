import { BuildContext } from './util/interfaces';
import { cleancss } from './cleancss';
import { closure, isClosureSupported } from './closure';
import { Logger } from './logger/logger';
import { transpileBundle } from './transpile';
import { uglifyjs } from './uglifyjs';


export function minify(context: BuildContext) {

  const logger = new Logger('minify');

  return minifyWorker(context)
    .then(() => {
      logger.finish();
    })
    .catch(err => {
      throw logger.fail(err);
    });
}


function minifyWorker(context: BuildContext) {
  // both css and js minify can run at the same time
  return Promise.all([
    minifyJs(context),
    minifyCss(context)
  ]);
}


export function minifyJs(context: BuildContext) {
  return isClosureSupported(context).then((result: boolean) => {
    if (result) {
      return closure(context);
    }

    return runUglify(context);
  });
}

function runUglify(context: BuildContext) {
  // with uglify, we need to make sure the bundle is es5 first
  return Promise.resolve()
  .then(() => {
    if (context.requiresTranspileDownlevel) {
      return transpileBundle(context);
    }
  }).then(() => {
    return uglifyjs(context);
  });
}

export function minifyCss(context: BuildContext) {
  return cleancss(context);
}
