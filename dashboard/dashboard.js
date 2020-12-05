
const url = require("url");
const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const config = require("../config");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const GuildSettings = require("../models/settings");


const app = express();
const MemoryStore = require("memorystore")(session);


module.exports = async (client) => {
  // We declare absolute paths.
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`); 
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`); 

              
  
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  
 
  passport.use(new Strategy({
    clientID: config.id,
    clientSecret: config.clientSecret,
    callbackURL: `${config.domain}/callback`,
    
    scope: ["identify", "guilds"]
  },
  (accessToken, refreshToken, profile, done) => { 

    process.nextTick(() => done(null, profile));
  }));

  
  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
    resave: false,
    saveUninitialized: false,
  }));


  app.use(passport.initialize());
  app.use(passport.session());
app.use(express.static(__dirname + '/assets'));
 
  app.locals.domain = config.domain.split("//")[1];

 
  app.engine("html", ejs.renderFile);
  app.set("view engine", "html");


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


  const renderTemplate = (res, req, template, data = {}) => {
  
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
 
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };

 
  const checkAuth = (req, res, next) => {

    if (req.isAuthenticated()) return next();
  
    req.session.backURL = req.url;
 
    res.redirect("/login");
  }

  
  app.get("/login", (req, res, next) => {
   
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL; 
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    
    next();
  },
  passport.authenticate("discord"));

  
  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  });

 
  app.get("/logout", function (req, res) {
 
    req.session.destroy(() => {

      req.logout();
    
      res.redirect("/");
    });
  });

  app.get("/", (req, res) => {
    renderTemplate(res, req, "index.ejs");
  });

 
  app.get("/dashboard", checkAuth, (req, res) => {

    renderTemplate(res, req, "dashboard.ejs", { perms: Discord.Permissions });
  });

  
  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD")) return res.redirect("/dashboard");

 
    var storedSettings = await GuildSettings.findOne({ gid: guild.id });
    if (!storedSettings) {
      
      const newSettings = new GuildSettings({
        gid: guild.id
      });
      await newSettings.save().catch(()=>{});
      storedSettings = await GuildSettings.findOne({ gid: guild.id });
    }
  
    renderTemplate(res, req, "settings.ejs", { guild, settings: storedSettings, alert: null });
  });

    
    app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
        
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect("/dashboard");
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect("/dashboard");
        if (!member.permissions.has("MANAGE_GUILD")) return res.redirect("/dashboard");
 
        var storedSettings = await GuildSettings.findOne({ gid: guild.id });
        if (!storedSettings) {
      
          const newSettings = new GuildSettings({
            gid: guild.id
          });
          await newSettings.save().catch(()=>{});
          storedSettings = await GuildSettings.findOne({ gid: guild.id });
        }
      
        storedSettings.prefix = req.body.prefix;
        storedSettings.welcomeChannel = req.body.welcome;
        storedSettings.levelMessages = req.body.level;
        storedSettings.global = req.body.global
        await storedSettings.save().catch(() => {});
     
        renderTemplate(res, req, "settings.ejs", { guild, settings: storedSettings, alert: "Your settings have been saved." });
    });

  app.listen(config.port, null, null, () => console.log(`Dashboard is up and running on port ${config.port}.`));
};