import TabView from "./TabView.js";
import TabData from "../../core/TabData.js";
import * as StringUtils from "../../util/StringUtils.js";
import { SessionCommand } from "../../messages/Messages.js";
import TabContextMenu from "../TabContextMenu.js";
import SessionView from "../SessionView.js";

type Bookmark = browser.bookmarks.BookmarkTreeNode;

export default class SimpleList extends TabView {

	private list:HTMLOListElement = document.createElement("ol");

	constructor(session:SessionView) {
		super(session);
	}

	public createHTML(tabBookmarks:Bookmark[]): HTMLOListElement {
		this.populateList(tabBookmarks);
		return this.list;
	}

	private populateList(tabBookmarks:Bookmark[]) {
		this.setTabCountClass(tabBookmarks.length);

		let ol = this.list;
		ol.innerHTML = "";

		tabBookmarks.forEach(
			bm => ol.appendChild(this.createTabView(bm))
		);
	}

	private createTabView(tabBookmark:Bookmark):HTMLLIElement {
		let data:TabData = TabData.createFromBookmark(tabBookmark);

		let li:HTMLLIElement = document.createElement("li");
		li.id = "tab" + tabBookmark.id;

		let a:HTMLAnchorElement = document.createElement("a");
		a.classList.add("tab");
		a.textContent = StringUtils.limit(data.title, 80);
		a.dataset.id = tabBookmark.id;
		a.href = data.url;
		a.title = data.getHostname();
		a.onclick = e => {
			e.preventDefault();

			SessionCommand.send("restore-single", {
				sessionId: tabBookmark.parentId,
				tabBookmarkId: tabBookmark.id
			});
		};
		a.addEventListener("contextmenu", e => {
			e.stopImmediatePropagation();
			e.preventDefault();

			let menu = new TabContextMenu(this.sessionView, this, tabBookmark);
			menu.showAt(e.clientX, e.clientY);
		});

		if(data.isInReaderMode) {
			li.appendChild(this.createStateIcon("rm"));
		}

		if(data.pinned) {
			li.appendChild(this.createStateIcon("pinned"));
		}

		li.appendChild(a);

		return li;
	}

	private setTabCountClass(n:number):void {
		if(n >= 10 && n < 100) {
			this.list.classList.add("geq10");
			this.list.classList.remove("geq100");
		} else if(n >= 100) {
			this.list.classList.add("geq100");
		} else {
			this.list.classList.remove("geq10");
			this.list.classList.remove("geq100");
		}
	}

	public update(tabBookmarks:Bookmark[]) {
		// temporary solution
		this.populateList(tabBookmarks);
	}

	private createStateIcon(type:"pinned"|"rm"):HTMLElement {
		let icon = document.createElement("span");
		icon.classList.add("state-icon");
		icon.classList.add(type);

		return icon;
	}
}