package org.camunda.community.zeebe.play.zeebe

import java.time.Duration
import java.time.Instant

interface ZeebeService {

    fun start()

    fun stop()

    fun getCurrentTime(): Instant

    fun increaseTime(duration: Duration): Long

    fun isRunning(): Boolean

}