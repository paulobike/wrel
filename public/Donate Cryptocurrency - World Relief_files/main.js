jQuery(function(e) {
    ! function() {
        e(".toggle-hidden-menu").on("click", function() {
            e(this).hasClass("toggle-opened") ? (e(this).addClass("toggle-closed").removeClass("toggle-opened"), e("body, html").removeClass("body-is-mobile"), e(".hidden-menu.opened").addClass("closed").removeClass("opened")) : ($main_menu = e(e(".main-menu")[0]), menu_height = $main_menu.offset().top + $main_menu.height(), e(".hidden-menu").css("top", menu_height), e(this).addClass("toggle-opened").removeClass("toggle-closed"), e("body, html").addClass("body-is-mobile"), e(".hidden-menu.closed").addClass("opened").removeClass("closed"))
        }), e(".navbar--hidden .menu-item-has-children .fl-menu-toggle").on("click", function(n) {
            $this = e(this), $submenu = $this.parent().siblings(".sub-menu"), $this.hasClass("toggle-opened") ? ($this.addClass("toggle-closed").removeClass("toggle-opened"), $submenu.css("max-height", "0"), console.log("submenu closed")) : ($this.addClass("toggle-opened").removeClass("toggle-closed"), scrollHeight = $submenu[0].scrollHeight, $submenu.css("max-height", scrollHeight))
        })
    }()
}), jQuery(function(e) {}), jQuery(function(e) {
    ! function() {
        e(".main-menu .menu--action .sub-menu .menu-item a").on("click", function(e) {
            e.stopPropagation()
        }), e(".main-menu .menu--action > .menu-item-has-children").on("click", function(e) {
            e.preventDefault()
        })
    }()
}), jQuery(function(e) {
    ! function() {
        e(".open-search").on("click", function() {
            var n = e(".hidden-modal--search .search-form");
            return setTimeout(function() {
                e.magnificPopup.open({
                    removalDelay: 0,
                    closeBtnInside: !0,
                    showCloseBtn: !0,
                    overflowY: "scroll",
                    mainClass: "modal__wrapper",
                    items: {
                        src: n
                    },
                    type: "inline"
                })
            }, 100), !1
        })
    }()
});
//# sourceMappingURL=../maps/main.min.js.map