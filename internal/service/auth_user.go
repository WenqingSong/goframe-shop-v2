package service

import (
	"context"
	"time"

	"goframe-shop-v2/internal/dao"
	"goframe-shop-v2/internal/model/entity"
	"goframe-shop-v2/utility"

	jwt "github.com/gogf/gf-jwt/v2"
	"github.com/gogf/gf/v2/frame/g"
)

var userAuthService *jwt.GfJWTMiddleware

func UserAuth() *jwt.GfJWTMiddleware {
	return userAuthService
}

func init() {
	userAuth := jwt.New(&jwt.GfJWTMiddleware{
		Realm:           "shop-frontend",
		Key:             []byte("secret key user"),
		Timeout:         time.Minute * 60,
		MaxRefresh:      time.Minute * 60,
		IdentityKey:     "user_id",
		TokenLookup:     "header: Authorization, query: token, cookie: jwt_frontend",
		TokenHeadName:   "Bearer",
		TimeFunc:        time.Now,
		Authenticator:   UserAuthenticator,
		Unauthorized:    Unauthorized,
		PayloadFunc:     UserPayloadFunc,
		IdentityHandler: UserIdentityHandler,
	})
	userAuthService = userAuth
}

// UserPayloadFunc 生成前台用户 JWT 的 payload
func UserPayloadFunc(data interface{}) jwt.MapClaims {
	claims := jwt.MapClaims{}
	if user, ok := data.(*entity.UserInfo); ok {
		claims["user_id"] = user.Id
		claims["name"] = user.Name
		claims["status"] = user.Status
	}
	return claims
}

// UserIdentityHandler 从 JWT 中提取用户 ID
func UserIdentityHandler(ctx context.Context) interface{} {
	claims := jwt.ExtractClaims(ctx)
	g.Log().Info(ctx, "UserIdentityHandler 当前用户ID:", claims[userAuthService.IdentityKey])
	return claims[userAuthService.IdentityKey]
}

// UserAuthenticator 校验前台用户登录
func UserAuthenticator(ctx context.Context) (interface{}, error) {
	r := g.RequestFromCtx(ctx)
	name := r.Get("name").String()
	password := r.Get("password").String()

	if name == "" || password == "" {
		return nil, jwt.ErrMissingLoginValues
	}

	var user entity.UserInfo
	if err := dao.UserInfo.Ctx(ctx).Where(dao.UserInfo.Columns().Name, name).Scan(&user); err != nil {
		return nil, jwt.ErrFailedAuthentication
	}
	// 使用 EncryptPassword 校验密码
	if utility.EncryptPassword(password, user.UserSalt) != user.Password {
		return nil, jwt.ErrFailedAuthentication
	}

	return &user, nil
}
