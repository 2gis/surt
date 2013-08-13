module.exports = function(grunt) {

    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        jshint: {
            appjs: {
                options: {
                    "indent": 4,
                    "node": true,
                    "browser": true,
                    "jquery": true,
                    "eqnull": true,
                    "eqeqeq": false,
                    "devel": false,
                    "boss": true,
                    "trailing": true,
                    "loopfunc": true,
                    "-W041": true,
                    "-W015": true,
                    "unused": true
                },
                src: ['src/*.js', 'demo/main.js', 'test/*.js']
            }
        },
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
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['concat:def', 'uglify:def']);
    grunt.registerTask('dom', ['mocha-phantomjs']);
    grunt.registerTask('test', ['mochacli', 'mocha-phantomjs']);
    grunt.registerTask('unit', ['mochacli']);
    grunt.registerTask('t', ['jshint', 'mochacli', 'mocha-phantomjs']);
};