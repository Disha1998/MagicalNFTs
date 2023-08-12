import React, { useEffect, useState } from "react";
import { tranding_category_filter } from "../../data/categories_data";
import CategoryItem from "./categoryItem";
import { useSelector, useDispatch } from "react-redux";
import { updateTrendingCategoryItemData } from "../../redux/counterSlice";
const Trending_categories_items = ({ data }) => {
  const [itemdata, setItemdata] = useState(data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateTrendingCategoryItemData(itemdata.slice(0, 8)));
  }, [itemdata, dispatch]);

  return (
    <>
      <CategoryItem data={data} />
    </>
  );
};

export default Trending_categories_items;
