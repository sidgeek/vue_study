export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Cloud Editor API',
    version: '0.1.0',
    description: '基于 Koa 的本地开发 API 文档（file 模式）'
  },
  servers: [
    { url: '/api', description: '本地开发（相对路径）' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          nickname: { type: 'string', nullable: true },
          roleId: { type: 'integer' }
        },
        required: ['id', 'username', 'roleId']
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        },
        required: ['token', 'user']
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: '健康检查',
        responses: {
          '200': {
            description: '服务健康',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string' } },
                  required: ['status']
                }
              }
            }
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: '用户注册',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['username', 'password']
              }
            },
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: '注册成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': { description: '参数缺失' },
          '409': { description: '用户名已存在' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: '用户登录',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            },
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: '登录成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '400': { description: '参数缺失' },
          '401': { description: '用户名或密码错误' }
        }
      }
    },
    '/me': {
      get: {
        summary: '当前用户信息',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { description: '未授权' }
        }
      }
    }
    ,
    '/users': {
      get: {
        summary: '用户列表（分页）',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'pageSize', in: 'query', required: false, schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 } }
        ],
        responses: {
          '200': {
            description: '获取成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  },
                  required: ['items', 'page', 'pageSize', 'total']
                }
              }
            }
          }
        }
      }
    }
    ,
    '/users/{id}/role': {
      post: {
        summary: '为用户分配角色',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  roleId: { type: 'integer' },
                  roleCode: { type: 'string', enum: ['SUPER_ADMIN','ADMIN','STAFF','VISITOR'] }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '更新成功',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          },
          '400': { description: '请求参数非法或角色不存在' }
        }
      }
    }
  }
}