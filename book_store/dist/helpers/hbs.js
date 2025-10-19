import moment from "moment";
export default {
    formatDate(date, targetFormat) {
        if (!date)
            return "Unavailable";
        return moment(date).format(targetFormat);
    },
    radioCheck(value, radioValue) {
        return value === radioValue ? "checked" : "";
    },
    replaceCommas(value) {
        if (!value)
            return "None";
        return value.replace(/,/g, " | ");
    },
    adminCheck(value) {
        if (value?.isadmin) {
            console.log("Admin Account Detected");
            return true;
        }
        else if (value) {
            console.log("User Account Detected");
            return false;
        }
        else {
            console.log("Not logged in");
            return false;
        }
    },
    convertUpper(value) {
        return value.toUpperCase();
    },
    loopNTimes(pages) {
        const result = [];
        for (let i = 1; i <= pages; i++)
            result.push(i);
        return result;
    },
    checkPage(pageValue) {
        return pageValue > 0;
    },
    formatDeliveryStatus(status) {
        const map = {
            unknown: "Unknown",
            pre_transit: "Pre-transit",
            in_transit: "In-transit",
            out_for_delivery: "Out for delivery",
            delivered: "Delivered",
            return_to_sender: "Return to sender",
            failure: "Failure",
        };
        return map[status] ?? "Unknown";
    },
    async manualSessionSave(req) {
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return reject(err);
                }
                resolve();
            });
        });
    },
    async manualSessionSaveNoCaching(req, res) {
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return reject(err);
                }
                resolve();
            });
        });
        res.set("Cache-Control", "no-store");
    },
    async saveSession(req) {
        return new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.log("Session failed to save");
                    reject(err);
                }
                else {
                    resolve("Saving session...");
                }
            });
        });
    },
};
//# sourceMappingURL=hbs.js.map