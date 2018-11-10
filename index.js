"use strict";

const path = require("path");

const BbPromise = require("bluebird");
const fse = require("fs-extra");
const dockart = require('serverless-docker-artifacts');

BbPromise.promisifyAll(fse);


const ARGS = {version: true, leptonica_version: true, tessdata: true, tessdata_url: true};


class ServerlessTesseract {
  create() {
    this.serverless.cli.log('Adding tesseract artifacts...')

    // Overwrite error message
    if (fse.existsSync('tesseract-standalone'))
      throw Error(`The target path "tesseract-standalone" is occupied. ` +
                  `Run "sls tesseract clean" to remove all artifacts.`);

    dockart.createArtifact({
      path: __dirname,
      copy: 'tesseract-standalone',
      args: this.args,
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

    let custom = this.serverless.config.serverless.service.custom;
    this.args = custom && custom.tesseract || {};
    Object.keys(this.args).forEach(arg => {
      if (!ARGS[arg])
        throw Error(`Unknown tesseract config var "${arg}". ` +
                    `Available arguments are: version, leptonica_version, tessdata, tessdata_url.`);
    })

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
