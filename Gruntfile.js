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
        }
    });

    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-contrib-watch')

    grunt.registerTask('default', ['react']);

};