const Package = require('../models/package'),
methods = require('../assets/methods');
const User = require('../models/user');

const packageCalculation = (route) => (req, res, next) => {
    let user;
    if(route === 'admin') user = req.params.id
    else user = req.user._id;
    User.findById(user)
    .then(async foundUser => {
        Package.find({'user.id': user, active: true})
        .then(async packages => {
            if(packages.length) {
                for(const package of packages)  {
                // packages.forEach(package => {
                    let packageHours = getHours(new Date(package.date));
                    let hoursBetween = getHoursBetween(packageHours);
                    let packageDetails = methods.getPackageDetailsByName(package.name)
                    let packageDuration = package.duration || packageDetails.duration;
                    let earningsPerHour = package.toEarn / Number(packageDuration);
                    let currentEarnings = earningsPerHour * hoursBetween;
                    if( hoursBetween >= Number(packageDuration) ) {                        
                        package.active = false;
                        package.dailyEarnings = Math.round(package.toEarn * 100) / 100;
                        foundUser.balance += package.dailyEarnings;
                        foundUser.activePackageCount -= 1;
                        await package.save();
                    } else {
                        package.dailyEarnings = Math.round(currentEarnings * 100) / 100;
                        await package.save();
                    };
                // });
                }
                await foundUser.save();
                // setTimeout(_ => next(), 500); 
                next();         
            } else next();            
        });     
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'Some resources aren\'t loaded. Please refresh');
        next();
    });
}

module.exports = packageCalculation;

const getHours = (date) => {
    let dateObject = new Date(date);
    let ms = dateObject.getTime();
    let hours = ms / (1000 * 60 * 60);
    return hours;
}

const getHoursBetween = (packageHours) => {
    let today = new Date();
    let todaysHours = getHours(today);
    let hoursBetween = todaysHours - packageHours;
    return hoursBetween;
}