import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/Exploremenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";

const Home = () => {
    const [category, setCategory] = useState("All");
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const q = searchParams.get("q") || "";

    useEffect(() => {
        if (location.hash === "#food-display") {
            const id = "food-display";
            requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    }, [location.hash, q]);

    return (
        <div>
            <Header />
            <ExploreMenu category={category} setCategory={setCategory} />
            <FoodDisplay category={category} searchQuery={q} />
            <AppDownload />
        </div>
    );
};

export default Home;
