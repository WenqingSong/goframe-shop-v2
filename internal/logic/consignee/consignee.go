package consignee

import (
	"context"
	"github.com/gogf/gf/v2/util/gconv"
	"goframe-shop-v2/internal/consts"
	"goframe-shop-v2/internal/dao"
	"goframe-shop-v2/internal/model"
	"goframe-shop-v2/internal/model/entity"
	"goframe-shop-v2/internal/service"
)

type sConsignee struct{}

func init() {
	service.RegisterConsignee(New())
}

func New() *sConsignee {
	return &sConsignee{}
}

// GetList 查询内容列表
func (s *sConsignee) GetList(ctx context.Context, in model.ConsigneeGetListInput) (out *model.ConsigneeGetListOutput, err error) {
	// 获取当前用户ID
	userId := gconv.Uint(ctx.Value(consts.CtxUserId))
	
	var (
		m = dao.ConsigneeInfo.Ctx(ctx).Where(dao.ConsigneeInfo.Columns().UserId, userId)
	)
	out = &model.ConsigneeGetListOutput{
		Page: in.Page,
		Size: in.Size,
	}

	// 分配查询
	listModel := m.Page(in.Page, in.Size)

	// 执行查询
	var list []*entity.ConsigneeInfo
	if err := listModel.Scan(&list); err != nil {
		return out, err
	}
	// 没有数据
	if len(list) == 0 {
		return out, nil
	}
	out.Total, err = m.Count()
	if err != nil {
		return out, err
	}
	//不指定item的键名用：Scan
	if err := listModel.Scan(&out.List); err != nil {
		return out, err
	}
	return
}

// Add 添加收货地址
func (s *sConsignee) Add(ctx context.Context, in model.AddConsigneeInput) (out *model.AddConsigneeOutput, err error) {
	// 如果设置为默认地址，先将该用户的其他地址设置为非默认
	if in.IsDefault == 1 {
		_, err = dao.ConsigneeInfo.Ctx(ctx).
			Where(dao.ConsigneeInfo.Columns().UserId, in.UserId).
			Data(dao.ConsigneeInfo.Columns().IsDefault, 0).
			Update()
		if err != nil {
			return out, err
		}
	}

	// 插入新地址
	id, err := dao.ConsigneeInfo.Ctx(ctx).Data(in).InsertAndGetId()
	if err != nil {
		return out, err
	}

	return &model.AddConsigneeOutput{Id: uint(id)}, nil
}

// Update 更新收货地址
func (s *sConsignee) Update(ctx context.Context, in model.UpdateConsigneeInput) (out *model.UpdateConsigneeOutput, err error) {
	// 如果设置为默认地址，先将该用户的其他地址设置为非默认
	if in.IsDefault == 1 {
		_, err = dao.ConsigneeInfo.Ctx(ctx).
			Where(dao.ConsigneeInfo.Columns().UserId, in.UserId).
			Where(dao.ConsigneeInfo.Columns().Id+"!=", in.Id).
			Data(dao.ConsigneeInfo.Columns().IsDefault, 0).
			Update()
		if err != nil {
			return out, err
		}
	}

	// 更新地址信息
	_, err = dao.ConsigneeInfo.Ctx(ctx).
		Where(dao.ConsigneeInfo.Columns().Id, in.Id).
		Where(dao.ConsigneeInfo.Columns().UserId, in.UserId).
		Data(in).
		Update()
	if err != nil {
		return out, err
	}

	return &model.UpdateConsigneeOutput{Id: in.Id}, nil
}

// Delete 删除收货地址
func (s *sConsignee) Delete(ctx context.Context, in model.DeleteConsigneeInput) (out *model.DeleteConsigneeOutput, err error) {
	// 删除地址
	_, err = dao.ConsigneeInfo.Ctx(ctx).
		Where(dao.ConsigneeInfo.Columns().Id, in.Id).
		Delete()
	if err != nil {
		return out, err
	}

	return &model.DeleteConsigneeOutput{Id: in.Id}, nil
}
