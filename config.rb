cache_dir = 'cache/.compass-cache'

# Sources
sass_dir = 'src/scss'
images_dir = 'assets/img'
fonts_dir = 'assets/fonts'

# for development
line_comments = environment != :production
line_comments = false
output_style = (environment == :production) ? :compressed : :expanded