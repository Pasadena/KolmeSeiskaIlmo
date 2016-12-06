
name := """KolmeSeiskaIlmo"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  cache,
  ws,
  "com.typesafe.play" %% "play-slick" % "2.0.0",
  "com.typesafe.play" %% "play-slick-evolutions" % "2.0.0",
  "com.typesafe.play" %% "play-mailer" % "5.0.0",
  "org.postgresql" % "postgresql" % "9.4.1211",
  "it.innove" % "play2-pdf" % "1.5.1",
  "org.apache.poi" % "poi" % "3.8",
  "org.apache.poi" % "poi-ooxml" % "3.9",
  "org.scalatestplus.play" %% "scalatestplus-play" % "1.5.0" % "test",
  "org.mockito" % "mockito-core" % "1.9.5" % "test"
)

libraryDependencies += evolutions

PlayKeys.playRunHooks += WebpackHook(baseDirectory.value)

routesGenerator := InjectedRoutesGenerator
