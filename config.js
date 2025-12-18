/* For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
let config = {
	address: "0.0.0.0",	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
									// you must set the sub path here. basePath must end with a /
	ipWhitelist: [],	// Set [] to allow all IP addresses
									// or add a specific IPv4 of 192.168.1.5 :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
									// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false,		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "",	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "",	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",
	logLevel: [
		"INFO",
		"LOG",
		"WARN",
		"ERROR",
		"DEBUG"
	],
	timeFormat: 12,
	units: "imperial",

	modules: [
		{
			module: "MMM-Cursor",
		},
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "MMM-GoogleCalendar",
			header: "Family Calendar",
			position: "top_left",
			config: {
				maximumNumberOfDays: 4,
				maximumEntries: 20,
				maxTitleLength: 30,
				fade: false,
				colored: true,
				coloredSymbolOnly: true,
				timeFormat: "dateheaders",
				dateFormat: "ddd D MMM",
				customEvents: [
					{keyword: 'Birthday', symbol: 'birthday-cake', color: 'Gold'},
					{keyword: 'Anniversary', symbol: 'ring', color: 'Gold'},
					{keyword: 'pick up', symbol: 'car-side'},
					{keyword: 'bells', symbol: 'bell'},
					{keyword: 'BOJS', symbol: 'bell'},
					{keyword: 'Garbage', symbol: 'trash-can'},
					{keyword: 'Recycling', symbol: 'recycle'}
				],
				calendars: [
					{
						symbol: "calendar-days",
						calendarID: "en.usa#holiday@group.v.calendar.google.com",
						name: "Holidays",
						color: "#A79B8E"
					},
					{
						symbol: "house",
						calendarID: "family00623387192279647047@group.calendar.google.com",
						name: "Family",
						color: "#D81B60"
					},
					{
						symbol: "people-group",
						calendarID: "00234df3613b8e8d6349db1253a48bf6c230c07a3a4fe7b36e437f821e9d5884@group.calendar.google.com",
						name: "John & Shauna Gibby Family Calendar",
						color: "#DA5234"
					},
					{
						symbol: "people-group",
						calendarID: "00234df3613b8e8d6349db1253a48bf6c230c07a3a4fe7b36e437f821e9d5884@group.calendar.google.com",
						name: "Shefchik Family Calendar",
						color: "#DA5234"
					},
					{
						symbol: "leaf",
						calendarID: "cgibby@gmail.com",
						name: "Curtis",
						color: "#E7BA51"
					},
					{
						symbol: "heart",
						calendarID: "sarahagibby@gmail.com",
						name: "Sarah",
						color: "#9E69AF"
					},
					// {
					// 	symbol: "person-falling",
					// 	calendarID: "audreylgibby@gmail.com",
					// 	name: "Atlas",
					// 	color: "#009688"
					// },
					// {
					// 	symbol: "fish-fins",
					// 	calendarID: "41g3184199hvnvpb3o51mkq0qk@group.calendar.google.com",
					// 	name: "Atlas Work",
					// 	color: "#009688"
					// },
					{
						symbol: "cat",
						calendarID: "nathancgibby@gmail.com",
						name: "Melia",
						color: "#D6837A"
					},
					{
						symbol: "pepper-hot",
						calendarID: "154440f7793bcc13fbe8c075af60c428d43e6b7fcc500474284031b9b23854c2@group.calendar.google.com",
						name: "Melia Work",
						color: "#D6837A"
					},
					{
						symbol: "ghost",
						calendarID: "clairergibby@gmail.com",
						name: "Bean",
						color: "#489160"
					},
					{
						symbol: "gamepad",
						calendarID: "benjaminwmgibby@gmail.com",
						name: "Ben",
						color: "#4B99D2"
					},
					{
						symbol: "dragon",
						calendarID: "josephhgibby@gmail.com",
						name: "Joe",
						color: "#F09300"
						
					
					}
				]
			}
		},
		{
			module: "MMM-GoogleCalendar-ChoreList",
			header: "Chores",
			position: "top_center",
			config: {
				maximumNumberOfDays: 0,
				maximumEntries: 20,
				maxTitleLength: 40,
				fade: false,
				colored: true,
				coloredSymbolOnly: false,
				timeFormat: "dateheaders",
				dateFormat: "ddd D MMM",
				customEvents: [
					{keyword: 'Sweep', symbol: 'broom', color: '#E67C73'},
					{keyword: 'Table', symbol: 'mug-saucer', color: '#0B8043'},
					{keyword: 'Handwash', symbol: 'sink', color: '#8E24AA'},
					{keyword: 'Pots', symbol: 'sink', color: '#8E24AA'},
					{keyword: 'Dishwasher', symbol: 'utensils', color: '#3F51B5'},
					{keyword: 'Cats', symbol: 'cat', color: '#F4511E'},
					{keyword: 'Dinner', symbol: 'burger', color: '#F6BF26'},
					{keyword: 'Bathroom', symbol: 'toilet', color: '#039BE5'},
					{keyword: 'garbage', symbol: 'trash-can', color: '#33B679'},
					{keyword: 'plants', symbol: 'plant-wilt'},
					{keyword: 'Bedroom', symbol: 'bed'},
					{keyword: 'Vacuum', symbol: 'wind'},
					{keyword: 'laundry', symbol: 'shirt', color: '#7986CB'},
					{keyword: 'piano', symbol: 'music'},
					{keyword: 'writing', symbol: 'pencil'},
				],
				calendars: [
					{
						symbol: "calendar-days",
						calendarID: "27d420866b411f767874fd3b83a8e37a394831dc651fe80aaa9db3e09c29b3f0@group.calendar.google.com",
						name: "Family Chores",
						color: "#7C7C7C"
					}
				],
				people: [
					{
						symbol: "leaf",
						name: "Curtis",
						color: "#E7BA51"
					},
					{
						symbol: "heart",
						name: "Sarah",
						color: "#9E69AF"
					},
					{
						symbol: "cat",
						name: "Melia",
						color: "#D6837A"
					},
					{
						symbol: "ghost",
						name: "Bean",
						color: "#489160"
					},
					{
						symbol: "gamepad",
						name: "Ben",
						color: "#4B99D2"
					},
					{
						symbol: "dragon",
						name: "Joe",
						color: "#F09300"
					},
				]

			}
		},
		{
			module: "weather",
			position: "top_right",
			config: {
				weatherProvider: "openmeteo",
				type: "current",
				lat: 40.3916,
				lon: -111.8508,
				showWindDirection: false,
				showWindDirectionAsArrow: false,
			}
		},
		{
			module: "weather",
			position: "top_right",
			header: "Weather Forecast",
			config: {
				colored: true,
				fade: false,
				weatherProvider: "openmeteo",
				type: "forecast",
				lat: 40.3916,
				lon: -111.8508
			}
		},
		//{
			//module: "MMM-GooglePhotos",
			//position: "bottom_center",
			//config: {
				//albums: [
					//'London/Paris (August/Sept 2024)'
					//// 'Gibby Family photos - 2024',
					//// 'Shefchik reunion 2024',
					//// 'Costa Rica 2024',
					//// 'Lifestreams Images',
					//// 'Shefchik Calendar 2024',
					//// 'Shefchik calendar 2023',
					//// 'Puerto Rico 2022',
					//// 'Grandpa Nielsen funeral',
					//// 'Dominican Republic 2021',
					//// 'Shefchik Family Reunion - 2016',
					//// 'Gibby-Sims Las Vegas 2024',
					//// 'John, Joseph & 8 others', // too many photos?
					//// 'Atlas, Sarah & 5 others', // too many photos?
				//],
				//updateInterval: 1000 * 60, // milliseconds, minimum 10 seconds.
				//sort: "random", // "old", "random"
				//showWidth: 600, // These values will be used for quality of downloaded photos to show. real size to show in your MagicMirror region is recommended.
				//showHeight: 450,
				//timeFormat: "relative",
				//// timeFormat: "YYYY-MM-DD HH:mm", // Or `relative` can be used.
			//}
		//},
		// {
		// 	module: 'MMM-ImageSlideshow',
		// 	position: 'bottom_right',
		// 	config: {
		// 		imagePaths: [
		// 			'modules/MMM-ImageSlideshow/Images/Cropped',
		// 			'modules/MMM-ImageSlideshow/Images/Photos',
		// 			'modules/MMM-ImageSlideshow/Images/Family/2019',
		// 			'modules/MMM-ImageSlideshow/Images/Family/2020',
		// 			'modules/MMM-ImageSlideshow/Images/Family/2021',
		// 			'modules/MMM-ImageSlideshow/Images/Family/2022',
		// 			'modules/MMM-ImageSlideshow/Images/Family/2023',
		// 			'modules/MMM-ImageSlideshow/Images',
		// 		],
		// 		imageStyleString: "object-fit: scale-down; width: 870px; height: 350px;", // best image scaling within sizes
		//         pathStyleText: 'nameonly',
        //         imgTitleTextPos: 1,
		//         randomizeImageOrder: true,
		// 		treatAllPathsAsOne: true,
		// 		validImageFileExtensions: 'bmp,jpg,jpeg,gif,png',
		// 		slideshowSpeed: 1000 * 30, // milliseconds
		// 	}
		// },
		{
			module: "newsfeed",
			position: "bottom_right",
			config: {
				feeds: [
					{
						title: "Google News",
						url: "https://news.google.com/rss"
					},
					{
						title: "Yahoo News",
						url: "https://www.yahoo.com/news/rss"
					},
					{
						title: "KSL News",
						url: "https://www.ksl.com/rss/news"
					},
					{
						title: "ABC4 News",
						url: "https://www.abc4.com/feed/"
					},
					{
						title: "SL Tribune",
						url: "https://www.sltrib.com/arc/outboundfeeds/rss/?outputType=xml"
					},
					{
						title: "Associated Press",
						url: "https://rsshub.app/apnews/topics/apf-topnews"
					}
				],
				updateInterval: 1000 * 30, // milliseconds
				animationSpeed: 750, // milliseconds
				prohibitedWords: ['Sports', 'ESPN', 'Horoscope', 'MLB', 'NBA', 'NFL', 'NHL', 'MLS'],
				showSourceTitle: true,
				showPublishDate: true,
				// showDescription: true,
				showTitleAsUrl: true
			}
		},
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
