/* Magic Mirror
 * Module: MMM-GoogleCalendar
 *
 * adaptation of MM default calendar module for Google Calendar events
 * MIT Licensed.
 */
Module.register("MMM-GoogleCalendar-ChoreList", {
  // Define module defaults
  defaults: {
    maximumEntries: 10, // Total Maximum Entries
    maximumNumberOfDays: 1,
    pastDaysCount: 0,
    limitDays: 0, // Limit the number of days shown, 0 = no limit
    displaySymbol: true,
    defaultSymbol: "calendar", // Fontawesome Symbol see https://fontawesome.com/cheatsheet?from=io
    showLocation: false,
    displayRepeatingCountTitle: false,
    defaultRepeatingCountTitle: "",
    maxTitleLength: 25,
    maxLocationTitleLength: 25,
    wrapEvents: false, // wrap events to multiple lines breaking at maxTitleLength
    wrapLocationEvents: false,
    maxTitleLines: 3,
    maxEventTitleLines: 3,
    fetchInterval: 5 * 60 * 1000, // Update every 5 minutes.
    animationSpeed: 2000,
    fade: true,
    urgency: 7,
    timeFormat: "relative",
    dateFormat: "MMM Do",
    dateEndFormat: "LT",
    fullDayEventDateFormat: "MMM Do",
    showEnd: false,
    getRelative: 6,
    fadePoint: 0.25, // Start on 1/4th of the list.
    hidePrivate: false,
    hideOngoing: false,
    hideTime: false,
    hideDuplicates: false,
    colored: false,
    coloredSymbolOnly: false,
    customEvents: [], // Array of {keyword: "", symbol: "", color: ""} where Keyword is a regexp and symbol/color are to be applied for matched
    calendars: [
      {
        symbol: "calendar",
        url: "https://www.calendarlabs.com/templates/ical/US-Holidays.ics"
      }
    ],
    people: [
      {
        name: 'Tim',
        color: '#3F51B5'
      }
    ],
    titleReplace: {
      "De verjaardag van ": "",
      "'s birthday": ""
    },
    locationTitleReplace: {
      "street ": ""
    },
    broadcastEvents: false,
    excludedEvents: [],
    sliceMultiDayEvents: false,
    nextDaysRelative: false,
	broadcastPastEvents: false,
  },

  requiresVersion: "2.1.0",

  // Define required scripts.
  getStyles: function () {
    return ["chore-list.css", "font-awesome.css"];
  },

  // Define required scripts.
  getScripts: function () {
    return ["moment.js"];
  },

  // Define required translations.
  getTranslations: function () {
    return {
      en: "translations/en.json"
    };
  },

  // Override start method.
  start: function () {
    Log.info("Starting module: " + this.name);

    // Set locale.
    moment.updateLocale(
      config.language,
      this.getLocaleSpecification(config.timeFormat)
    );

    // clear data holder before start
    this.calendarData = {};

    // indicate no data available yet
    this.loaded = false;

    // check if current URL is module's auth url
    if (location.search.includes(this.name)) {
      this.sendSocketNotification("MODULE_READY", {
        queryParams: location.search
      });
    } else {
      // check user token is authenticated.
      this.sendSocketNotification("MODULE_READY");
    }
  },

  // Override socket notification handler.
  socketNotificationReceived: function (notification, payload) {
    // Authentication done before any calendar is fetched
    if (notification === "AUTH_FAILED") {
      let error_message = this.translate(payload.error_type);
      this.error = this.translate("MODULE_CONFIG_ERROR", {
        MODULE_NAME: this.name,
        ERROR: error_message
      });
      this.loaded = true;
      this.updateDom(this.config.animationSpeed);
      return;
    }

    if (notification === "AUTH_NEEDED") {
      this.error = "ERROR_AUTH_NEEDED";
      if (payload.credentialType === "web") {
        this.errorUrl = payload.url;
      }
      this.updateDom(this.config.animationSpeed);
      return;
    } else {
      // reset error URL
      this.errorUrl = null;
    }

    if (notification === "SERVICE_READY") {
      // start fetching calendars
      this.fetchCalendars();
    }

    if (this.identifier !== payload.id) {
      return;
    }

    if (notification === "CALENDAR_EVENTS") {
      if (this.hasCalendarID(payload.calendarID)) {
        this.calendarData[payload.calendarID] = payload.events;
        this.error = null;
        this.loaded = true;

        if (this.config.broadcastEvents) {
          this.broadcastEvents();
        }
      }
    } else if (notification === "CALENDAR_ERROR") {
      let error_message = this.translate(payload.error_type);
      this.error = this.translate("MODULE_CONFIG_ERROR", {
        MODULE_NAME: this.name,
        ERROR: error_message
      });
      this.loaded = true;
    }

    this.updateDom(this.config.animationSpeed);
  },

  // Override dom generator.
  getDom: function () {
    // Define second, minute, hour, and day constants
    const oneSecond = 1000; // 1,000 milliseconds
    const oneMinute = oneSecond * 60;
    const oneHour = oneMinute * 60;
    const oneDay = oneHour * 24;

    const events = this.createEventList();
    const wrapper = document.createElement("div");
    wrapper.className = "grid-container";
    for (let person of this.config.people) {
      // Find all events for this person
      const personEvents = events.filter(event => {
        return event.summary && event.summary.startsWith(person.name);
      });

      // Skip if no events found
      if (personEvents.length === 0) {
        continue;
      }
      let personWrapper = document.createElement("div");
      personWrapper.style.cssText = "border-color: " + person.color;
      personWrapper.innerHTML = "<h2 class='title' style='color:" + person.color + "'>" + person.name + "</h2>";
      personWrapper.className = "person";
      let eventList = document.createElement("ul");
      eventList.className = "events";
      for (let event of personEvents) {
        let eventItem = document.createElement("li");
        eventItem.innerHTML = event.summary.substring(person.name.length + 3); // Remove "Name - " prefix

        // Color events if custom color is specified
        if (this.config.customEvents.length > 0) {
          for (let ev in this.config.customEvents) {
            if (
              typeof this.config.customEvents[ev].color !== "undefined" &&
              this.config.customEvents[ev].color !== ""
            ) {
              let needle = new RegExp(this.config.customEvents[ev].keyword, "gi");
              if (needle.test(event.title)) {
                // Respect parameter ColoredSymbolOnly also for custom events
                if (!this.config.coloredSymbolOnly) {
                  eventItem.style.cssText =
                    "color:" + this.config.customEvents[ev].color;
                }
                break;
              }
            }
          }
        }


        if (this.config.displaySymbol) {
          const symbolWrapper = document.createElement("div");

          if (this.config.colored && this.config.coloredSymbolOnly) {
            symbolWrapper.style.cssText =
              "color:" + this.colorForCalendar(event.calendarID);
          }
  
          const symbolClass = this.symbolClassForCalendar(event.calendarID);
          symbolWrapper.className = "symbol align-left " + symbolClass;
  
          const symbols = this.symbolsForEvent(event);
          // If symbols are displayed and custom symbol is set, replace event symbol
          if (this.config.displaySymbol && this.config.customEvents.length > 0) {
            for (let ev in this.config.customEvents) {
              if (
                typeof this.config.customEvents[ev].symbol !== "undefined" &&
                this.config.customEvents[ev].symbol !== ""
              ) {
                let needle = new RegExp(
                  this.config.customEvents[ev].keyword,
                  "gi"
                );
                if (needle.test(event.title)) {
                  symbols[0] = this.config.customEvents[ev].symbol;
                  break;
                }
              }
            }
          }
          symbols.forEach((s, index) => {
            const symbol = document.createElement("span");
            symbol.className = "fa fa-fw fa-" + s;
            if (index > 0) {
              symbol.style.paddingLeft = "5px";
            }
            symbolWrapper.appendChild(symbol);
          });
          eventItem.prepend(symbolWrapper);
        }
        eventList.appendChild(eventItem);
      }
      personWrapper.appendChild(eventList);
      wrapper.appendChild(personWrapper);
    }
    return wrapper;
  },

  /**
	 * Filter out events according to the calendar config
	 * @param {object} event the google calendar event
	 * @param {array} eventsList the array of event
	 * @returns {boolean}
	 */
  filterEvent: function(event, eventsList) {

	// check if event name is in the excluded list
	if (this.config.excludedEvents?.length && this.config.excludedEvents.includes(event.summary)) {
		Log.debug(`Event ${event.id} filtered due to excludedEvents settings`);
		return true
	}

	if (this.config.hidePrivate && ['private', 'confidential'].includes(event.visibility?.toLowerCase())) {
		return true;
  	}

	if (this.config.hideDuplicates && this.listContainsEvent(eventsList, event)) {
		return true;
	}

	const now = new Date();

	if (this.config.hideOngoing && event.startDate < now && event.endDate > now) {
		return true;
	}

	return false;
	},

  fetchCalendars: function () {
    this.config.calendars.forEach((calendar) => {
      if (!calendar.calendarID) {
        Log.warn(this.name + ": Unable to fetch, no calendar ID found!");
        return;
      }

      const calendarConfig = {
		maximumEntries: calendar.maximumEntries,
		maximumNumberOfDays: calendar.maximumNumberOfDays,
		broadcastPastEvents: calendar.broadcastPastEvents,
		excludedEvents: calendar.excludedEvents,
      };

      if (
        calendar.symbolClass === "undefined" ||
        calendar.symbolClass === null
      ) {
        calendarConfig.symbolClass = "";
      }
      if (calendar.titleClass === "undefined" || calendar.titleClass === null) {
        calendarConfig.titleClass = "";
      }
      if (calendar.timeClass === "undefined" || calendar.timeClass === null) {
        calendarConfig.timeClass = "";
      }

      // tell helper to start a fetcher for this calendar
      // fetcher till cycle
      this.addCalendar(calendar.calendarID, calendarConfig);
    });
  },

  /**
   * This function accepts a number (either 12 or 24) and returns a moment.js LocaleSpecification with the
   * corresponding timeformat to be used in the calendar display. If no number is given (or otherwise invalid input)
   * it will a localeSpecification object with the system locale time format.
   *
   * @param {number} timeFormat Specifies either 12 or 24 hour time format
   * @returns {moment.LocaleSpecification} formatted time
   */
  getLocaleSpecification: function (timeFormat) {
    switch (timeFormat) {
      case 12: {
        return { longDateFormat: { LT: "h:mm A" } };
      }
      case 24: {
        return { longDateFormat: { LT: "HH:mm" } };
      }
      default: {
        return {
          longDateFormat: { LT: moment.localeData().longDateFormat("LT") }
        };
      }
    }
  },

  /**
   * Checks if this config contains the calendar ID.
   *
   * @param {string} ID The calendar ID
   * @returns {boolean} True if the calendar config contains the ID, False otherwise
   */
  hasCalendarID: function (ID) {
    for (const calendar of this.config.calendars) {
      if (calendar.calendarID === ID) {
        return true;
      }
    }

    return false;
  },

  /**
   * Parse google date obj
   * @param {*} googleDate
   * @returns timestamp
   */
  extractCalendarDate: function (googleDate) {
    // case is "all day event"
    if (googleDate.hasOwnProperty("date")) {
      return moment(googleDate.date).valueOf();
    }

    return moment(googleDate.dateTime).valueOf();
  },

  /**
   * Creates the sorted list of all events.
   *
   * @returns {object[]} Array with events.
   */
  createEventList: function () {
    const now = new Date();
    const today = moment().startOf("day");
    const future = moment()
      .endOf("day")
      .add(this.config.maximumNumberOfDays, "days")
      .toDate();
    let events = [];

    const formatStr = undefined;

    for (const calendarID in this.calendarData) {
      const calendar = this.calendarData[calendarID];
      for (const e in calendar) {
        const event = JSON.parse(JSON.stringify(calendar[e])); // clone object

        // added props
        event.calendarID = calendarID;
        event.endDate = this.extractCalendarDate(event.end);
        event.startDate = this.extractCalendarDate(event.start);

		// check if event is to be excluded
		if (this.filterEvent(event, events)) {
			continue;
		}

		// exclude if events are duplicate - this check is outside filterEvent fn
		// to prevent overloading on passing params
		if (this.config.hideDuplicates && this.listContainsEvent(events, event)) {
			continue;
		}


        event.url = event.htmlLink;
        event.today =
          event.startDate >= today &&
          event.startDate < today + 24 * 60 * 60 * 1000;
        event.title = event.summary;

        /* if sliceMultiDayEvents is set to true, multiday events (events exceeding at least one midnight) are sliced into days,
         * otherwise, esp. in dateheaders mode it is not clear how long these events are.
         */
        const maxCount =
          Math.ceil(
            (event.endDate -
              1 -
              moment(event.startDate, formatStr)
                .endOf("day")
                .format(formatStr)) /
              (1000 * 60 * 60 * 24)
          ) + 1;
        if (this.config.sliceMultiDayEvents && maxCount > 1) {
          const splitEvents = [];
          let midnight = moment(event.startDate, formatStr)
            .clone()
            .startOf("day")
            .add(1, "day")
            .format(formatStr);
          let count = 1;
          while (event.endDate > midnight) {
            const thisEvent = JSON.parse(JSON.stringify(event)); // clone object
            thisEvent.today =
              thisEvent.startDate >= today &&
              thisEvent.startDate < today + 24 * 60 * 60 * 1000;
            thisEvent.endDate = midnight;
            thisEvent.title += " (" + count + "/" + maxCount + ")";
            splitEvents.push(thisEvent);

            event.startDate = midnight;
            count += 1;
            midnight = moment(midnight, formatStr)
              .add(1, "day")
              .format(formatStr); // next day
          }
          // Last day
          event.title += " (" + count + "/" + maxCount + ")";
          splitEvents.push(event);

          for (let splitEvent of splitEvents) {
            if (splitEvent.end > now && splitEvent.end <= future) {
              events.push(splitEvent);
            }
          }
        } else {
          events.push(event);
        }
      }
    }

    events.sort(function (a, b) {
      return a.startDate - b.startDate;
    });

    // Limit the number of days displayed
    // If limitDays is set > 0, limit display to that number of days
    if (this.config.limitDays > 0) {
      let newEvents = [];
      let lastDate = today.clone().subtract(1, "days").format("YYYYMMDD");
      let days = 0;
      for (const ev of events) {
        let eventDate = moment(ev.startDate, formatStr).format("YYYYMMDD");
        // if date of event is later than lastdate
        // check if we already are showing max unique days
        if (eventDate > lastDate) {
          // if the only entry in the first day is a full day event that day is not counted as unique
          if (
            newEvents.length === 1 &&
            days === 1 &&
            newEvents[0].fullDayEvent
          ) {
            days--;
          }
          days++;
          if (days > this.config.limitDays) {
            continue;
          } else {
            lastDate = eventDate;
          }
        }
        newEvents.push(ev);
      }
      events = newEvents;
    }

    return events.slice(0, this.config.maximumEntries);
  },

  listContainsEvent: function (eventList, event) {
    for (const evt of eventList) {
      if (
        evt.summary === event.summary &&
        parseInt(evt.startDate) === parseInt(event.startDate)
      ) {
        return true;
      }
    }
    return false;
  },

  /**
   * Requests node helper to add calendar ID
   *
   * @param {string} calendarID string
   * @param {object} calendarConfig The config of the specific calendar
   */
  addCalendar: function (calendarID, calendarConfig) {
    this.sendSocketNotification("ADD_CALENDAR", {
      id: this.identifier,
      calendarID,
      excludedEvents:
        calendarConfig.excludedEvents || this.config.excludedEvents,
      maximumEntries:
        calendarConfig.maximumEntries || this.config.maximumEntries,
      maximumNumberOfDays:
        calendarConfig.maximumNumberOfDays || this.config.maximumNumberOfDays,
      pastDaysCount:
        calendarConfig.pastDaysCount || this.config.pastDaysCount,
      fetchInterval: this.config.fetchInterval,
      symbolClass: calendarConfig.symbolClass,
      titleClass: calendarConfig.titleClass,
      timeClass: calendarConfig.timeClass,
	  broadcastPastEvents: calendarConfig.broadcastPastEvents || this.config.broadcastPastEvents,
    });
  },

  /**
   * Retrieves the symbols for a specific event.
   *
   * @param {object} event Event to look for.
   * @returns {string[]} The symbols
   */
  symbolsForEvent: function (event) {
    let symbols = this.getCalendarPropertyAsArray(
      event.calendarID,
      "symbol",
      this.config.defaultSymbol
    );

    if (
      event.recurringEvent === true &&
      this.hasCalendarProperty(event.calendarID, "recurringSymbol")
    ) {
      symbols = this.mergeUnique(
        this.getCalendarPropertyAsArray(
          event.calendarID,
          "recurringSymbol",
          this.config.defaultSymbol
        ),
        symbols
      );
    }

    if (
      event.fullDayEvent === true &&
      this.hasCalendarProperty(event.calendarID, "fullDaySymbol")
    ) {
      symbols = this.mergeUnique(
        this.getCalendarPropertyAsArray(
          event.calendarID,
          "fullDaySymbol",
          this.config.defaultSymbol
        ),
        symbols
      );
    }

    return symbols;
  },

  /**
   * Retrieves the symbols for a specific event.
   *
   * @param {object} event Event to look for.
   * @returns {string[]} The symbols
   */
  symbolsForEvent: function (event) {
    let symbols = this.getCalendarPropertyAsArray(
      event.calendarID,
      "symbol",
      this.config.defaultSymbol
    );

    if (
      event.recurringEvent === true &&
      this.hasCalendarProperty(event.calendarID, "recurringSymbol")
    ) {
      symbols = this.mergeUnique(
        this.getCalendarPropertyAsArray(
          event.calendarID,
          "recurringSymbol",
          this.config.defaultSymbol
        ),
        symbols
      );
    }

    if (
      event.fullDayEvent === true &&
      this.hasCalendarProperty(event.calendarID, "fullDaySymbol")
    ) {
      symbols = this.mergeUnique(
        this.getCalendarPropertyAsArray(
          event.calendarID,
          "fullDaySymbol",
          this.config.defaultSymbol
        ),
        symbols
      );
    }

    return symbols;
  },

  mergeUnique: function (arr1, arr2) {
    return arr1.concat(
      arr2.filter(function (item) {
        return arr1.indexOf(item) === -1;
      })
    );
  },

  /**
   * Retrieves the symbolClass for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @returns {string} The class to be used for the symbols of the calendar
   */
  symbolClassForCalendar: function (calendarID) {
    return this.getCalendarProperty(calendarID, "symbolClass", "");
  },

  /**
   * Retrieves the titleClass for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @returns {string} The class to be used for the title of the calendar
   */
  titleClassForCalendar: function (calendarID) {
    return this.getCalendarProperty(calendarID, "titleClass", "");
  },

  /**
   * Retrieves the timeClass for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @returns {string} The class to be used for the time of the calendar
   */
  timeClassForCalendar: function (calendarID) {
    return this.getCalendarProperty(calendarID, "timeClass", "");
  },

  /**
   * Retrieves the calendar name for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @returns {string} The name of the calendar
   */
  calendarNameForCalendar: function (calendarID) {
    return this.getCalendarProperty(calendarID, "name", "");
  },

  /**
   * Retrieves the color for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @returns {string} The color
   */
  colorForCalendar: function (calendarID) {
    return this.getCalendarProperty(calendarID, "color", "#fff");
  },

  /**
   * Retrieves the count title for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @returns {string} The title
   */
  countTitleForCalendar: function (calendarID) {
    return this.getCalendarProperty(
      calendarID,
      "repeatingCountTitle",
      this.config.defaultRepeatingCountTitle
    );
  },

  /**
   * Helper method to retrieve the property for a specific calendar ID.
   *
   * @param {string} calendarID The calendar ID
   * @param {string} property The property to look for
   * @param {string} defaultValue The value if the property is not found
   * @returns {*} The property
   */
  getCalendarProperty: function (calendarID, property, defaultValue) {
    for (const calendar of this.config.calendars) {
      if (
        calendar.calendarID === calendarID &&
        calendar.hasOwnProperty(property)
      ) {
        return calendar[property];
      }
    }

    return defaultValue;
  },

  getCalendarPropertyAsArray: function (calendarID, property, defaultValue) {
    let p = this.getCalendarProperty(calendarID, property, defaultValue);
    if (!(p instanceof Array)) p = [p];
    return p;
  },

  hasCalendarProperty: function (calendarID, property) {
    return !!this.getCalendarProperty(calendarID, property, undefined);
  },

  /**
   * Shortens a string if it's longer than maxLength and add a ellipsis to the end
   *
   * @param {string} string Text string to shorten
   * @param {number} maxLength The max length of the string
   * @param {boolean} wrapEvents Wrap the text after the line has reached maxLength
   * @param {number} maxTitleLines The max number of vertical lines before cutting event title
   * @returns {string} The shortened string
   */
  shorten: function (string, maxLength, wrapEvents, maxTitleLines) {
    if (typeof string !== "string") {
      return "";
    }

    if (wrapEvents === true) {
      const words = string.split(" ");
      let temp = "";
      let currentLine = "";
      let line = 0;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (
          currentLine.length + word.length <
          (typeof maxLength === "number" ? maxLength : 25) - 1
        ) {
          // max - 1 to account for a space
          currentLine += word + " ";
        } else {
          line++;
          if (line > maxTitleLines - 1) {
            if (i < words.length) {
              currentLine += "&hellip;";
            }
            break;
          }

          if (currentLine.length > 0) {
            temp += currentLine + "<br>" + word + " ";
          } else {
            temp += word + "<br>";
          }
          currentLine = "";
        }
      }

      return (temp + currentLine).trim();
    } else {
      if (
        maxLength &&
        typeof maxLength === "number" &&
        string.length > maxLength
      ) {
        return string.trim().slice(0, maxLength) + "&hellip;";
      } else {
        return string.trim();
      }
    }
  },

  /**
   * Capitalize the first letter of a string
   *
   * @param {string} string The string to capitalize
   * @returns {string} The capitalized string
   */
  capFirst: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /**
   * Transforms the title of an event for usage.
   * Replaces parts of the text as defined in config.titleReplace.
   * Shortens title based on config.maxTitleLength and config.wrapEvents
   *
   * @param {string} title The title to transform.
   * @param {object} titleReplace Pairs of strings to be replaced in the title
   * @param {boolean} wrapEvents Wrap the text after the line has reached maxLength
   * @param {number} maxTitleLength The max length of the string
   * @param {number} maxTitleLines The max number of vertical lines before cutting event title
   * @returns {string} The transformed title.
   */
  titleTransform: function (
    title,
    titleReplace,
    wrapEvents,
    maxTitleLength,
    maxTitleLines
  ) {
    for (let needle in titleReplace) {
      const replacement = titleReplace[needle];

      const regParts = needle.match(/^\/(.+)\/([gim]*)$/);
      if (regParts) {
        // the parsed pattern is a regexp.
        needle = new RegExp(regParts[1], regParts[2]);
      }

      title = title.replace(needle, replacement);
    }

    title = this.shorten(title, maxTitleLength, wrapEvents, maxTitleLines);
    return title;
  },

  /**
   * Broadcasts the events to all other modules for reuse.
   * The all events available in one array, sorted on startDate.
   */
  broadcastEvents: function () {
    const now = new Date();
    const eventList = [];

    for (const calendarID in this.calendarData) {
      for (const ev of this.calendarData[calendarID]) {
        const event = Object.assign({}, ev);
        event.symbol = this.symbolsForEvent(event);
        event.calendarName = this.calendarNameForCalendar(calendarID);
        event.color = this.colorForCalendar(calendarID);
        delete event.calendarID;

        // Make a broadcasting event to be compatible with the default calendar module.
        event.title = event.summary;
        event.fullDayEvent = (event.start?.date && event.end?.date) ? true : false;
        let startDate = event.start?.date ?? event.start?.dateTime;
        let endDate = event.end?.date ?? event.end?.dateTime;
        event.startDate = (startDate) ? moment(startDate).valueOf() : null;
        event.endDate = (endDate) ? moment(endDate).valueOf() : null;

        if (this.config.broadcastEvents && !this.config.broadcastPastEvents && event.endDate < now) {
          continue
        }

        eventList.push(event);
      }
    }

    eventList.sort(function (a, b) {
      return a.startDate - b.startDate;
    });

    this.sendNotification("CALENDAR_EVENTS", eventList);
  }
});
