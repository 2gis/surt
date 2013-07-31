module.exports = function(grunt) {

    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        concat: {
            def: {
                src: [
                    'src/ui.js',
                    'src/parser.js',
                    'src/cursor.js'
                ],
                dest: '<%= pkg.name %>.js'
            }
        },
        'uglify': {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            def: {
                files: {
                    '<%= pkg.name %>.min.js': ['<%= pkg.name %>.js'],
                    'demo/<%= pkg.name %>.js': ['<%= pkg.name %>.js']
                }
            }
        },
        'mocha-phantomjs': {
            options: {
                view: '1024x768'
            },
            all: ['test/*.auto.html']
        },
        'mochacli': {
            options: {
                reporter: 'dot'
            },
            all: ['src/*.spec.js']
        }
    });

    grunt.loadTasks('tasks'); // Для grunt-mocha-phantomjs
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['concat:def', 'uglify:def']);
    grunt.registerTask('dom', ['mocha-phantomjs']);
    grunt.registerTask('test', ['mochacli', 'mocha-phantomjs']);
    grunt.registerTask('unit', ['mochacli']);
};