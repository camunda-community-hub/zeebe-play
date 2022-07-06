# zeebe-play


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