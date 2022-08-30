# zeebe-play

[![](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)](https://github.com/camunda-community-hub/community)
[![](https://img.shields.io/badge/Lifecycle-Incubating-blue)](https://github.com/Camunda-Community-Hub/community/blob/main/extension-lifecycle.md#incubating-)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![Compatible with: Camunda Platform 8](https://img.shields.io/badge/Compatible%20with-Camunda%20Platform%208-0072Ce)](https://github.com/camunda-community-hub/community/blob/main/extension-lifecycle.md#compatiblilty)

A web application for [Zeebe](https://camunda.com/platform/zeebe/) to play with processes. You could describe it as a [token simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) for executable processes (i.e. modeles enhanced with technical properties). It enables you to walk through your process by completing tasks and triggering events, in an intuative way.

You could use it to:
- explore how your process runs on Zeebe, the workflow engine of Camunda Platform 8
- check if your process with its technical properties behaves as expected
- replay a given scenario  

> **Disclaimer:** 
> This project is a **community-driven** extension and not officially supported by 
> Camunda. It is **not recommended** to be used in a production environment.  

### About

### Architecture

## Install

### Docker

### Docker Compose

## Configuration

### Using the embedded Zeebe engine

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

## Usage

For development, the ZeeQS's GraphQL API can be inspected by using http://localhost:8080/graphiql.

## Contributions

Contributions are welcome 🎉 Please have a look at the [Contribution Guide](./CONTRIBUTING.md).

## FAQ

### What is the difference to the bpmn-js token simulation?

The [bpmn-js token simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) is a great tool to get started with BPMN and to explore how your process is executed. 

You could use it model your process until it behaves as expected.


### What is the difference to the Zeebe Simple Monitor?

### Why did I create the project?

### Can I use it in production?

No. It is not recommended to use Zeebe Play in a production environment. 

The application is not designed to handle a big data, or to import the data reliable. And, it is too easy to manipulate a process accidentally.


## Code of Conduct

This project adheres to the Contributor Covenant [Code of
Conduct](/CODE_OF_CONDUCT.md). By participating, you are expected to uphold
this code. Read more about the [Camunda Community Code of Conduct](https://camunda.com/events/code-conduct/) and how to report unacceptable behavior.

## License

[Apache License, Version 2.0](/LICENSE) 
