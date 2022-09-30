import { React, useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import "./index.css";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import SubMenu from "antd/lib/menu/SubMenu";
import { connect } from "react-redux";
import axios from "axios";

const { Sider } = Layout;

const iconList = {
  "/home": <UserOutlined />,
  "/user-manage": <UserOutlined />,
  "/user-manage/list": <UserOutlined />,
  "/right-manage": <UserOutlined />,
  "/right-manage/role/list": <UserOutlined />,
  "/right-manage/right/list": <UserOutlined />,
  //.......
};

function SideMenu(props) {
  const [menu, setMenu] = useState([]);
  useEffect(() => {
    axios.get("/rights?_embed=children").then((res) => {
      console.log(res.data);
      setMenu(res.data);
    });
  }, []);

  const {
    role: { rights },
  } = JSON.parse(localStorage.getItem("token"));

  const CheckPagePermission = (item) => {
    return item.pagepermisson && rights.includes(item.key);
  };

  let navigate = useNavigate();

  // Menu
  const renderMenu = (menuList) => {
    return menuList.map((item) => {
      if (item.children?.length > 0 && CheckPagePermission(item)) {
        return (
          <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
            {renderMenu(item.children)}
          </SubMenu>
        );
      }

      return (
        CheckPagePermission(item) && (
          <Menu.Item
            key={item.key}
            icon={iconList[item.key]}
            onClick={() => navigate(item.key)}
          >
            {item.title}
          </Menu.Item>
        )
      );
    });
  };
  let location = useLocation();
  const selectKeys = [location.pathname]; // ex: ['/home']
  const openKeys = ["/" + location.pathname.split("/")[1]];
  return (
    <Sider trigger={null} collapsible collapsed={props.isCollapsed}>
      <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
        <div className="logo" />
        <div style={{ flex: 1, overflow: "auto" }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectKeys}
            defaultOpenKeys={openKeys}
          >
            {renderMenu(menu)}
          </Menu>
          e
        </div>
      </div>
    </Sider>
  );
}
const mapStateToProps = ({ CollApsedReducer: { isCollapsed } }) => ({
  isCollapsed,
});
export default connect(mapStateToProps)(SideMenu);
