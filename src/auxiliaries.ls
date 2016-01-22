#== helper functions ==
# fetches a JSON file
export fetch = (name, url, callback) !->
    console.time? "[fetch] #name"
    $.getJSON url, (data, status) !->
        console.timeEnd? "[fetch] #name"
        if status != \success or data.code != 200
            {code, message, data} = data
            errorHandler "Error ##code fetching #name: #message. #{data.message}."
        else
            callback data.data

export getScript = (name, exports, url, callback) !->
    if exports of window
        # looks like the script is already loaded
        return callback?!

    console.log "[getScript]", name
    (,status) <-! $.getScript url

    if status != \success
        return errorHandler "Error loading #name script: #status"

    # though unlikely, callback may be fired before script is executed
    # check if script exported desired variable, if not wait 5s
    if not exports of window
        setTimeout do
            !->
                # check again
                if not exports of window
                    # give up
                    return errorHandler "Error loading #name script: script file loaded, but apparently failed initializing. Maybe your browser is unsupported?"
                else
                    callback?!
            5_000ms
    else
        callback?!

# error handler
export errorHandler = (message) !->
    console.error(message)
    alert message #ToDo

# polyfill `console` object
if not window.console
    window.console =
        log: $.noop
window.console.warn ||= window.console.log
window.console.error ||= window.console.log

if not window.console.time or not window.console.timeEnd
    timers = {}
    window.console.time = (title) !->
        timers[title] = Date.now!
    window.console.timeEnd = (title) !->
        console.log title, "#{Date.now! - timers[title]}ms"
        delete timers[title]
