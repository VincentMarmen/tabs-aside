import OverlayMenu from "../util/OverlayMenu";
import SessionView from "./SessionView";
import * as OptionsManager from "../options/OptionsManager";
import { SessionCommand } from "../messages/Messages";
import { Bookmark } from "../util/Types";

let _i18n = browser.i18n.getMessage;

let activeSessions:boolean = true;

// needs to be loaded just once because sidebar will reload if this is changed
OptionsManager.getValue<boolean>("activeSessions").then(value => activeSessions = value);

export default class SessionOptionsMenu extends OverlayMenu {
	constructor(session:SessionView) {
		super();

		if(!activeSessions) {
			this.addItem("sidebar_session_restore_keep", () => {
				SessionCommand.send("restore", [session.bookmarkId, true]);
			}, "options-menu-restore-keep");
		}

		this.addItem("sidebar_session_rename", () => {
			session.editTitle();
		});

		this.addItem("sidebar_session_remove", () => {
			if(!confirm(_i18n("sidebar_session_remove_confirm"))) {
				return;
			}

			if(activeSessions && session.isActive()) {
				let keep:boolean = confirm(_i18n("sidebar_session_remove_keep_tabs"));

				SessionCommand.send("remove", [session.bookmarkId, keep]);
			} else {
				SessionCommand.send("remove", [session.bookmarkId, false]);
			}
		}, "options-menu-remove-session");

		this.addItem("sidebar_session_details", async () => {
			let bookmark:Bookmark = (await browser.bookmarks.get(session.bookmarkId))[0];

			alert([
				"Name: " + bookmark.title,
				"Bookmark ID: " + bookmark.id,
				"Added:\n" + new Date(bookmark.dateAdded).toISOString(),
				"Last change:\n" + new Date(bookmark.dateGroupModified).toISOString()
			].join("\n"));
		}, "options-menu-session-details");
	}
}