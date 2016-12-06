import java.net.InetSocketAddress

import play.sbt.PlayRunHook

import sbt._

object WebpackHook {

  def apply(base: File): PlayRunHook = {

    object WebpackProcess extends PlayRunHook {

      var process: Option[Process] = None

      override def beforeStarted(): Unit = {
        Process("webpack", base).run
      }

      override def afterStopped(): Unit = {
        process.map(p => p.destroy())
        process = None
      }
    }
    WebpackProcess
  }
}
