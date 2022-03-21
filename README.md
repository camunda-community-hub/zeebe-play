# zeebe-play


## Install

### Connecting to remote Zeebe

In the Zeebe broker:

* configure the Hazelcast exporter
* enable the clock endpoint to use the time travel function
  * `zeebe.clock.controlled: true` 
  * `ZEEBE_CLOCK_CONTROLLED=true`

In Zeebe Play:

* set the Hazelcast connection
