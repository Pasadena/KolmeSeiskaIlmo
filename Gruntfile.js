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
              {expand: true, src: ['node_modules/*'], dest: 'public/javascripts'}
            ]
          }
        }
    });

    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['react']);

    grunt.registerTask('heroku', ['react', 'copy']);

};