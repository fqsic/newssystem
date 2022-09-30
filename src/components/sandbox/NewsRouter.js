import React, { useState, useEffect } from "react";
import Home from "../../views/sandBox/home/Home";
import RightList from "../../views/sandBox/right-manage/RightList";
import RoleList from "../../views/sandBox/right-manage/RoleList";
import UserList from "../../views/sandBox/user-manage/UserList";
import NewsCategory from "../../views/sandBox/news-manage/NewsCategory";
import NewsAdd from "../../views/sandBox/news-manage/NewsAdd";
import NewsDraft from "../../views/sandBox/news-manage/NewsDraft";
import NoPermission from "../../views/sandBox/nopermission/Nopermission";
import Audit from "../../views/sandBox/audit-manage/Audit";
import AuditList from "../../views/sandBox/audit-manage/AuditList";
import Unpublished from "../../views/sandBox/publish-manage/Unpublished";
import Published from "../../views/sandBox/publish-manage/Published";
import Sunset from "../../views/sandBox/publish-manage/Sunset";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import NewsPreview from "../../views/sandBox/news-manage/NewsPreview";
import NewsUpdate from "../../views/sandBox/news-manage/NewsUpdate";
import { Spin } from "antd";
import { connect } from "react-redux";
const LocalRouterMap = {
  "/home": <Home />,
  "/user-manage/list": <UserList />,
  "/right-manage/role/list": <RoleList />,
  "/right-manage/right/list": <RightList />,
  "/news-manage/add": <NewsAdd />,
  "/news-manage/draft": <NewsDraft />,
  "/news-manage/category": <NewsCategory />,
  "/news-manage/preview/:id": <NewsPreview />,
  "/news-manage/update/:id": <NewsUpdate />,
  "/audit-manage/audit": <Audit />,
  "/audit-manage/list": <AuditList />,
  "/publish-manage/unpublished": <Unpublished />,
  "/publish-manage/published": <Published />,
  "/publish-manage/sunset": <Sunset />,
};

function NewsRouter(props) {
  const [backRouteList, setbackRouteList] = useState([]);

  useEffect(() => {
    Promise.all([axios.get("/rights"), axios.get("/children")]).then((res) => {
      setbackRouteList([...res[0].data, ...res[1].data]); //res[0]是primise对象，.data才是真正的值
    });
  }, []);

  const {
    role: { rights },
  } = JSON.parse(localStorage.getItem("token"));

  const checkRoute = (item) => {
    return (
      LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
    );
  };

  const checkUserPermission = (item) => {
    return rights.includes(item.key);
  };

  return (
    <Spin size="large" spinning={props.isLoading}>
      <Routes>
        {backRouteList.map((item) => {
          if (checkRoute(item) && checkUserPermission(item)) {
            return (
              <Route
                path={item.key}
                key={item.key}
                element={LocalRouterMap[item.key]}
              />
            );
          }
          return null;
        })}
        <Route path="/" element={<Navigate replace from="/" to="/home" />} />

        {backRouteList.length > 0 && (
          <Route path="*" element={<NoPermission />} />
        )}
      </Routes>
    </Spin>
  );
}
const mapStateToProps = ({ LoadingReducer: { isLoading } }) => ({
  isLoading,
});
export default connect(mapStateToProps)(NewsRouter);
