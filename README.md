#  zeebe-play

[![](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)](https://github.com/camunda-community-hub/community)
[![](https://img.shields.io/badge/Lifecycle-Incubating-blue)](https://github.com/Camunda-Community-Hub/community/blob/main/extension-lifecycle.md#incubating-)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![Compatible with: Camunda Platform 8](https://img.shields.io/badge/Compatible%20with-Camunda%20Platform%208-0072Ce)](https://github.com/camunda-community-hub/community/blob/main/extension-lifecycle.md#compatiblilty)

A web application for [Zeebe](https://camunda.com/platform/zeebe/) to play with processes. You could describe it as a [token simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) for executable processes (i.e. modeles enhanced with technical properties). It enables you to walk through your process by completing tasks and triggering events, in an intuative way.

✨ You could use it to:
- explore how your process runs on Zeebe, the workflow engine of Camunda Platform 8
- check if your process with its technical properties behaves as expected
- replay a given scenario  

---

![Demo](assets/zeebe-play-demo.gif)

---

### 🍪 Credits

Zeebe-Play is build on top of other great community projects, for example:
- [EZE](https://github.com/camunda-community-hub/eze), an embedded Zeebe engine to run the processes 
- [ZeeQS](https://github.com/camunda-community-hub/zeeqs), a GraphQL API to import and aggregate Zeebe's data
- [Zeebe Hazelcast Exporter](https://github.com/camunda-community-hub/zeebe-hazelcast-exporter), an exporter based on Hazelcast to consume Zeebe's data

### 🔥 Disclaimer

This project is a **community-driven** extension and not officially supported by Camunda. It is **not recommended** to be used in a production environment.  

## 🚀 Install

### Docker

..

### Docker Compose

..

## 🔧 Configuration 

### Default

..

### Connecting to remote Zeebe engine

In the Zeebe broker:

* configure the Hazelcast exporter
* enable the clock endpoint to use the time travel function
    * `zeebe.clock.controlled: true` (application.yaml)
    * `ZEEBE_CLOCK_CONTROLLED=true` (environment variable)

In Zeebe Play:

* set the Hazelcast connection (if needed, default: )
* set Zeebe broker connection (if needed)
* set Zeebe clock API (if needed)
* set `zeebe.engine: remote`

### Enable persistence

## 🏗️ Contributions

Contributions are welcome 🎉 Please have a look at the [Contribution Guide](./CONTRIBUTING.md).

## ❓ FAQ

### What is the difference to the bpmn-js token simulation?

The [bpmn-js token simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) is a great tool to learn BPMN. Since it doesn't run the process on Zeebe, the workflow engine of Camunda Platform 8, it ignores some technical properties of the process, like expressions, message correlations, or timers, or execute them differently. 

The token simulation is especially handy when crafting the process. Zeebe-Play shows its value when enhancing the technical properties of the process to execute it on Zeebe. 

### What is the difference to the Zeebe Simple Monitor?

The [Zeebe Simple Monitor](https://github.com/camunda-community-hub/zeebe-simple-monitor) is similar to Zeebe-Play but it focuses more on monitoring process instances. 

The goal of Zeebe-Play is to walk through a single process instance in an intuative way to understand how it is executed.  

### Can I use it in production?

No. It is not recommended to use Zeebe Play in a production environment. 

The application is not designed to handle big data, or to import the data reliable. And, it is too easy to manipulate a process accidentally.

## 🛂 Code of Conduct

This project adheres to the Contributor Covenant [Code of
Conduct](/CODE_OF_CONDUCT.md). By participating, you are expected to uphold
this code. Read more about the [Camunda Community Code of Conduct](https://camunda.com/events/code-conduct/) and how to report unacceptable behavior.

## 📖 License

[Apache License, Version 2.0](/LICENSE) 
