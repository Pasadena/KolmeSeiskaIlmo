
name := """KolmeSeiskaIlmo"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  cache,
  ws,
  "com.typesafe.play" %% "play-slick" % "2.0.0",
  "com.typesafe.play" %% "play-slick-evolutions" % "2.0.0",
  "org.webjars" %% "webjars-play" % "2.4.0-2",
  "org.webjars" % "bootstrap" % "3.0.0",
  "org.webjars" % "jquery-ui" % "1.11.2",
  "org.webjars" % "jquery-ui-themes" % "1.11.2",
  "org.webjars" % "requirejs" % "2.1.18",
  "org.webjars" % "jsx-requirejs-plugin" % "0.6.0",
  "org.webjars" % "react" % "0.13.3",
  "org.webjars" % "jquery" % "2.1.4",
  "org.webjars" % "react-router" % "0.13.2",
  "org.webjars" % "jsx-requirejs-plugin" % "0.6.0",
  "org.webjars" % "underscorejs" % "1.8.3",
  "org.webjars" % "react-bootstrap" % "0.19.1",
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
