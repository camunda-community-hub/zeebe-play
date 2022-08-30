# zeebe-play

[![](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)](https://github.com/camunda-community-hub/community)
[![](https://img.shields.io/badge/Lifecycle-Incubating-blue)](https://github.com/Camunda-Community-Hub/community/blob/main/extension-lifecycle.md#incubating-)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![Compatible with: Camunda Platform 8](https://img.shields.io/badge/Compatible%20with-Camunda%20Platform%208-0072Ce)](https://github.com/camunda-community-hub/community/blob/main/extension-lifecycle.md#compatiblilty)

A web application for [Zeebe](https://camunda.com/platform/zeebe/) to play with processes. 
 
:sparkle: Features: 
- walk through a process by completing tasks and triggering events
- run the processes on Zeebe, the workflow engine of Camunda Platform 8
- easy to set up, no external services required by using an embedded Zeebe engine

> Disclaimer: This project is a **community-driven** extension and not officially supported by
> Camunda. It is **not recommended** to be used in a production environment, or to be used as a
> monitoring application for processes.  

## Install

### Connecting to remote Zeebe

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

## Hints

For development, the ZeeQS's GraphQL API can be inspected by using http://localhost:8080/graphiql.


## FAQ

...
