import React from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Dropdown, Menu, Avatar } from "antd";
import { CollapseReducer } from "../../redux/reducer/CollapseReducer";
import { useNavigate } from "react-router";
import { connect } from "react-redux";
const { Header } = Layout;

function TopHeader(props) {
  let navigate = useNavigate();

  const changeCollapsed = () => {
    //改变state的isCollapsed
    // console.log(props)
    props.changeCollapsed();
  };

  const {
    role: { roleName },
    username,
  } = JSON.parse(localStorage.getItem("token"));

  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.antgroup.com"
            >
              {roleName}
            </a>
          ),
        },

        {
          key: "2",
          danger: true,
          label: "退出",
          onClick: () => {
            localStorage.removeItem("token");
            navigate("/login");
          },
        },
      ]}
    />
  );

  return (
    <Header
      className="site-layout-background"
      style={{
        padding: "0 16px",
      }}
    >
      {props.isCollapsed ? (
        <MenuUnfoldOutlined onClick={changeCollapsed} />
      ) : (
        <MenuFoldOutlined onClick={changeCollapsed} />
      )}
      <div style={{ float: "right" }}>
        <span>
          欢迎<span style={{ color: "#1890ff" }}>{username}</span>回来
        </span>
        <Dropdown overlay={menu}>
          <Avatar size="large" icon={<UserOutlined />} />
        </Dropdown>
      </div>
    </Header>
  );
}
const mapStateToProps = ({ CollApsedReducer: { isCollapsed } }) => {
  // console.log(state)
  return {
    isCollapsed,
  };
}; //状态映射成属性

const mapDispatchToProps = {
  changeCollapsed() {
    return {
      type: "change_collapsed",
      // payload:
    }; //action
  },
};

export default connect(mapStateToProps, mapDispatchToProps)(TopHeader);
