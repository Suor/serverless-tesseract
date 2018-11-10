"use strict";

const dockart = require('serverless-docker-artifacts');
// const child_process = require("child_process");
// // const path = require("path");
const BbPromise = require("bluebird");
// const _ = require("lodash");
const fse = require("fs-extra");

BbPromise.promisifyAll(fse);


// function validateArtifact(artifact) {
//   const art = Object.assign({path: '.', dockerfile: 'Dockerfile', args: {}}, artifact);
//   return art;
// }


class ServerlessTesseract {
  // Private implementation
  create() {
    if (fse.existsSync('tesseract-standalone'))
      throw Error(`The target path "tesseract-standalone" is occupied. ` +
                  `Run "sls tesseract clean" to remove all artifacts.`);

    dockart.createArtifact({
      path: __dirname,
      copy: 'tesseract-standalone',
      args: {},
    });

    fse.copySync(path.resolve(__dirname, "tesseract"), "tesseract");
  }

  clean() {
    const artifacts = ['tesseract-standalone', 'tesseract'];
    return BbPromise.all(artifacts.map(art => fse.removeAsync(art)));
  }

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    // let custom = this.serverless.config.serverless.service.custom;
    // this.artifacts = custom ?
    //   custom.dockerArtifacts || (custom.dockerArtifact ? [custom.dockerArtifact] : [])
    //   : [];

    this.commands = {
      tesseract: {
        commands: {
          create: {
            usage: "Create tesseract artifact.",
            lifecycleEvents: ["create"],
          },
          clean: {
            usage: "Remove artifacts.",
            lifecycleEvents: ["clean"],
          }
        }
      }
    };

    this.hooks = {
      "before:package:createDeploymentArtifacts": () => this.create(),
      "after:package:createDeploymentArtifacts": () => this.clean(),

      "tesseract:create:create": () => this.create(),
      "tesseract:clean:clean": () => this.clean(),

      // TODO: support functions?
      // "before:deploy:function:packageFunction": () =>
      // "after:deploy:function:packageFunction": () =>
    };
  }
}


module.exports = ServerlessTesseract;
