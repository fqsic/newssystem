import React, { useState, useEffect, useRef } from "react";
import { Button, Table, Modal, Switch } from "antd";
import axios from "axios";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import UserForm from "../../../components/user-manage/UserForm";

const { confirm } = Modal;
export default function UserList() {
  const [dataSource, setDataSource] = useState([]);
  const [isAddVisible, setisAddVisible] = useState(false);
  const [isUpdateVisible, setisUpdateVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [roleList, setroleList] = useState([]);
  const [regionList, setregionList] = useState([]);

  const [current, setcurrent] = useState(null);

  const [isUpdateDisabled, setisUpdateDisabled] = useState(false);
  const addForm = useRef(null);
  const updateForm = useRef(null);
  const { roleId, region, username } = JSON.parse(
    localStorage.getItem("token")
  );

  useEffect(() => {
    const roleObj = {
      1: "superadmin",
      2: "admin",
      3: "editor",
    };
    axios.get("/users?_expand=role").then((res) => {
      const list = res.data;
      setDataSource(
        roleObj[roleId] === "superadmin"
          ? list
          : [
              ...list.filter((item) => item.username === username),
              ...list.filter(
                (item) =>
                  item.region === region && roleObj[item.roleId] === "editor"
              ),
            ]
      );
    });
  }, [refresh]);
  //请求区域表
  useEffect(() => {
    axios.get("/regions").then((res) => {
      const list = res.data;

      setregionList(list);
    });
  }, [refresh]);
  //请求角色表
  useEffect(() => {
    axios.get("/roles").then((res) => {
      const list = res.data;

      setroleList(list);
    });
  }, [refresh]);

  const columns = [
    {
      title: "区域",
      dataIndex: "region",
      filters: [
        //筛选同区域用户
        ...regionList.map((item) => ({
          text: item.title,
          value: item.value,
        })),
        {
          text: "全球",
          value: "全球",
        },
      ],

      onFilter: (value, item) => {
        if (value === "全球") {
          return item.region === "";
        }
        return item.region === value;
      },

      render: (region) => {
        return <b>{region === "" ? "全球" : region}</b>;
      },
    },
    {
      title: "角色名称",
      dataIndex: "role",
      render: (role) => {
        return role?.roleName;
      },
    },
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "用户状态",
      dataIndex: "roleState",
      render: (roleState, item) => {
        return (
          <Switch
            checked={roleState}
            disabled={item.default}
            onChange={() => handleChange(item)}
          ></Switch>
        );
      },
    },
    {
      title: "操作",
      render: (item) => {
        return (
          <div>
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => confirmMethod(item)}
              disabled={item.default}
            />

            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              disabled={item.default}
              onClick={() => handleUpdate(item)}
            />
          </div>
        );
      },
    },
  ];

  const handleUpdate = (item) => {
    setisUpdateVisible(true);
    if (item.roleId === 1) {
      //禁用
      setisUpdateDisabled(true);
    } else {
      //取消禁用
      setisUpdateDisabled(false);
    }
    setTimeout(() => {
      updateForm.current.setFieldsValue(item);
    }, 0);

    setcurrent(item);
  };
  const handleChange = (item) => {
    // console.log(item)
    item.roleState = !item.roleState;
    setDataSource([...dataSource]);

    axios.patch(`/roles/${item.id}`, {
      roleState: item.roleState,
    });
  };

  const confirmMethod = (item) => {
    confirm({
      title: "你确定要删除?",
      icon: <ExclamationCircleOutlined />,

      onOk() {
        deleteMethod(item);
      },
      onCancel() {
        // console.log("Cancel");
      },
    });
  };

  //删除
  const deleteMethod = (item) => {
    // console.log(item)
    // 当前页面同步状态 + 后端同步

    setDataSource(dataSource.filter((data) => data.id !== item.id)); //过滤掉不等于的

    axios.delete(`/users/${item.id}`);
  };

  const addFormOK = () => {
    //validateFields()表单校验使用，primise对象，调用validateFields()对象，如果成功走.then,失败走catch
    addForm.current
      .validateFields()
      .then((value) => {
        // console.log(value)

        setisAddVisible(false); //隐藏显示

        addForm.current.resetFields(); //重置一组字段到 initialValues

        //post到后端，生成id，再设置 datasource, 方便后面的删除和更新
        axios
          .post(`/users`, {
            ...value,
            roleState: true, //是否打开
            default: false, //是否默认
          })
          .then((res) => {
            console.log(res.data);

            setDataSource([
              ...dataSource, //先展示以前的数据

              {
                ...res.data,
                role: roleList.filter((item) => item.id === value.roleId)[0],
              },
            ]);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateFormOK = () => {
    updateForm.current.validateFields().then((value) => {
      // console.log(value)
      setisUpdateVisible(false);

      setDataSource(
        dataSource.map((item) => {
          if (item.id === current.id) {
            return {
              ...item,
              ...value,
              role: roleList.filter((data) => data.id === value.roleId)[0],
            };
          }
          return item;
        })
      );
      setisUpdateDisabled(!isUpdateDisabled);

      axios.patch(`/users/${current.id}`, value);
    });
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setisAddVisible(true); //变true，显示
        }}
      >
        添加用户
      </Button>

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
        rowKey={(item) => item.id}
      />

      <Modal
        visible={isAddVisible} //是否能显示的关键，true就是显示，false就是隐藏
        title="添加用户"
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setisAddVisible(false); //变false，隐藏
        }}
        onOk={() => addFormOK()}
      >
        <UserForm
          regionList={regionList} //父组件传子组件
          roleList={roleList}
          ref={addForm}
        ></UserForm>
      </Modal>

      <Modal
        visible={isUpdateVisible}
        title="更新用户"
        okText="更新"
        cancelText="取消"
        onCancel={() => {
          setisUpdateVisible(false);
          setisUpdateDisabled(!isUpdateDisabled);
        }}
        onOk={() => updateFormOK()}
      >
        <UserForm
          regionList={regionList}
          roleList={roleList}
          ref={updateForm}
          isUpdateDisabled={isUpdateDisabled}
          isUpdate={true}
        ></UserForm>
      </Modal>
    </div>
  );
}
