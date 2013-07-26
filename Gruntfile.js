module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
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
        mochacli: {
            options: {
                reporter: 'dot'
            },
            all: ['dist/parser.spec.js']
        }
    });

    //grunt.loadNpmTasks('mocha-phantomjs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['uglify:def']);
    grunt.registerTask('dom', ['mocha-phantomjs']);
    grunt.registerTask('test', ['mochacli']);
};