module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        react: {
            dynamic_mappings: {
                files: [
                    {
                        expand: true,
                        cwd: 'app/assets/js',
                        src: ['**/*.jsx'],
                        dest: 'public/javascripts',
                        ext: '.js'
                    }
                ]
            }
        },
        watch: {
            scripts: {
                files: '**/*.jsx',
                tasks: ['react']
            }
        },
        copy: {
          main: {
            files: [
              {expand: true, src: ['./node_modules/flux/**/*', 'node_modules/validator/**/*', 'node_modules/react-bootstrap/**/*'], dest: 'public/javascripts'}
            ]
          }
        },
        clean: {
            build: {
                src: ['public/javascripts/node_modules/**/*']
            }
        }
    });

    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['react']);

    grunt.registerTask('heroku', ['react', 'clean', 'copy']);

};