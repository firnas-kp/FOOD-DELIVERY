import React from "react";
import "./Header.css";

const Header = () => {
    return (
        <div className="header">
            <div className="header-gradient" />
            <div className="header-contents">
                <p className="header-eyebrow">Tomato · food for every mood</p>
                <h1>Discover restaurants you will love</h1>
                <p className="header-lede">
                    Curated menus, quick delivery, and dishes from partner kitchens and our own Tomato Kitchen — all in
                    one place.
                </p>
                {/* <div className="header-search">
                    <span className="header-search-icon" aria-hidden>
                        ⌕
                    </span>
                    <input type="search" placeholder="Search for dishes or cuisines…" readOnly />
                    <a className="header-search-btn" href="#explore-menu">
                        Search
                    </a>
                </div> */}
                <a className="header-cta" href="#explore-menu">
                    Explore menu
                </a>
            </div>
        </div>
    );
};

export default Header;
