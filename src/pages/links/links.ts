const links = [
    {
        name: "Trying to Survive in Prison as a First Time Offender",
        dateAdded: "2022-12-29",
        url: "https://www.youtube.com/watch?v=bEWdAYvANcc",
        tags: ["fight"]
    },
    {
        name: "Jonny Kim on the Jocko Willink podcast",
        dateAdded: "2022-12-27",
        url: "https://www.youtube.com/watch?v=yujP3-AxXsI",
        tags: ["life", "podcast", "video"]
    },
    {
        name: "5 rules of programming by Rob Pike",
        dateAdded: "2021-12-13",
        url: "http://users.ece.utexas.edu/~adnan/pike.html",
        tags: ["programming"]
    },
    {
        name: "Writing system software: code comments. by antirez",
        dateAdded: "2021-10-02",
        url: "http://antirez.com/news/124",
        tags: ["programming"]
    },
    {
        name: "Using Failures, Movement & Balance to Learn Faster by Andrew Huberman",
        dateAdded: "2021-10-02",
        url: "https://www.youtube.com/watch?v=hx3U64IXFOY",
        tags: ["health", "podcast", "video"]
    },
    {
        name: "Timeline of the far future",
        dateAdded: "2021-05-27",
        url: "https://en.wikipedia.org/wiki/Timeline_of_the_far_future",
        tags: ["science", "sci-fi", "wiki"]
    },
    {
        name: "List of unusual articles",
        dateAdded: "2021-05-27",
        url: "https://en.wikipedia.org/wiki/Wikipedia:Unusual_articles",
        tags: ["fun", "wiki"]
    },
    {
        name: "How to Increase Motivation & Drive by Andrew Huberman",
        dateAdded: "2021-03-22",
        url: "https://www.youtube.com/watch?v=vA50EK70whE",
        tags: ["health", "podcast", "video"]
    },
    {
        name: "Django for Startup Founders: A better software architecture for SaaS startups",
        dateAdded: "2021-01-23",
        url: "https://news.ycombinator.com/item?id=27605052",
        tags: ["programming", "startups"]
    },
    {
        name: "Why the Canadian tech scene doesn't work",
        dateAdded: "2021-01-11",
        url: "https://alexdanco.com/2021/01/11/why-the-canadian-tech-scene-doesnt-work",
        tags: ["startups", "politics"]
    },
    {
        name: "How startups fail by Michael Seibel",
        dateAdded: "2020-09-03",
        url: "https://www.youtube.com/watch?v=Dgmmje5WHWA",
        tags: ["startups", "video"]
    },
    {
        name: "@sakanasakatsuki",
        dateAdded: "2020-04-29",
        url: "https://www.instagram.com/p/B_kNZdUjUj3/",
        tags: ["art", "sci-fi"]
    },
    {
        name: "How not to build a country: Canada's Late Soviet Pessimism",
        dateAdded: "2019-09-19",
        url: "https://palladiummag.com/2019/09/19/how-not-to-build-a-country-canadas-late-soviet-pessimism/",
        tags: ["politics", "economics"]
    },
    {
        name: "David Foster Wallace interview on Charlie Rose (1997)",
        dateAdded: "2018-11-23",
        url: "https://www.youtube.com/watch?v=GopJ1x7vK2Q",
        tags: ["art", "philosophy"]
    },
    {
        name: "Hack everything without fear by Drew Devault",
        dateAdded: "2018-03-17",
        url: "https://drewdevault.com/2018/03/17/Hack-everything-without-fear.html",
        tags: ["programming", "life"]
    },
    {
        name: "I want to read the works of great philosophers. In what order should I read them?",
        dateAdded: "2018-01-14",
        url: "https://qr.ae/pGBiTG",
        tags: ["philosophy"]
    },
    {
        name: "Actually, you CAN do it by Drew Devault",
        dateAdded: "2017-01-06",
        url: "https://drewdevault.com/2017/01/06/Actually-you-CAN-do-it.html",
        tags: ["programming", "life"]
    },
    {
        name: "Learning advanced mathematics without heading to university",
        dateAdded: "2016-05-12",
        url: "https://www.quantstart.com/articles/How-to-Learn-Advanced-Mathematics-Without-Heading-to-University-Part-1/",
        tags: ["math", "finance"]
    },
    {
        name: "What do insanely wealthy people buy, that ordinary people know nothing about?",
        dateAdded: "2015-01-19",
        url: "https://www.reddit.com/r/AskReddit/comments/2s9u0s/comment/cnnmca8/?context=3%27",
        tags: ["fun", "finance"]
    },
    {
        name: "5 Ways You're Sabotaging Your Own Life (Without Knowing It)",
        dateAdded: "2014-08-11",
        url: "https://www.cracked.com/blog/5-ways-youre-sabotaging-your-own-life-without-knowing-it",
        tags: ["life"]
    },
    {
        name: "Ideal undergraduate math sequence",
        dateAdded: "2014-05-25",
        url: "https://matheducators.stackexchange.com/questions/2386/ideal-undergraduate-sequence/2391#2391",
        tags: ["math"]
    },
    {
        name: "Lean into the pain",
        dateAdded: "2012-09-01",
        url: "http://www.aaronsw.com/weblog/dalio",
        tags: ["life"]
    },
    {
        name: "Believe you can change",
        dateAdded: "2012-08-18",
        url: "http://www.aaronsw.com/weblog/dweck",
        tags: ["life"]
    },
    {
        name: "Don't share your goals",
        dateAdded: "2010-09-02",
        url: "https://www.youtube.com/watch?v=NHopJHSlVo4",
        tags: ["life", "video"]
    },
    {
        name: "Summer Project Demo",
        dateAdded: "2009-05-11",
        url: "https://www.youtube.com/watch?v=OWi8zRfOFQ0",
        tags: ["music", "video"]
    },
    {
        name: "Outlawz :: Bye Bye Mythica",
        dateAdded: "2008-01-31",
        url: "https://www.youtube.com/watch?v=6YzKqkcdBQQ",
        tags: ["rob", "video"]
    },
    {
        name: "Write down what you've done by Terence Tao",
        dateAdded: "2007-10-13",
        url: "https://terrytao.wordpress.com/career-advice/write-down-what-youve-done/",
        tags: ["math", "video"]
    },
    {
        name: "The only thing that matters by pmarca",
        dateAdded: "2007-06-25",
        url: "https://pmarchive.com/guide_to_startups_part4.html",
        tags: ["startups"]
    },
    {
        name: "Steve Jobs' Stanford commencement speech",
        dateAdded: "2005-06-12",
        url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
        tags: ["startups", "life", "video"]
    },
]

export default links
