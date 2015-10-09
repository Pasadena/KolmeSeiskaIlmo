import play.PlayImport.PlayKeys.playRunHooks
import play.PlayScala

name := """KolmeSeiskaIlmo"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws,
  "com.typesafe.slick" %% "slick" % "2.1.0",
  "com.typesafe.play" %% "play-slick" % "0.8.0",
  "org.webjars" 			%% 	"webjars-play" 				% "2.3.0",
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
  "com.typesafe.play" %% "play-mailer" % "2.4.1",
  "postgresql" % "postgresql" % "9.1-901-1.jdbc4",
  "it.innove" % "play2-pdf" % "1.0.0"
)

playRunHooks <+= baseDirectory.map(base => GruntHook(base))

