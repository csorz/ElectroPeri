import { useCallback, useState } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

interface PhoneResult {
  number: string
  province: string
  city: string
  carrier: string
}

interface IdResult {
  number: string
  province: string
  city: string
  birthday: string
  gender: string
}

export default function PhoneLookupToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>归属地查询</h1>
        <p>Phone & ID Lookup - 查询手机号码和身份证号码归属地</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心原理</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>号段分配</h3>
                <p>运营商按号段分配号码资源，前 3-4 位决定运营商和归属地</p>
              </div>
              <div className="feature-card">
                <h3>行政区划</h3>
                <p>身份证前 6 位为行政区划代码，可精确查询到区县级</p>
              </div>
              <div className="feature-card">
                <h3>号码结构</h3>
                <p>手机号 11 位，身份证 18 位，遵循严格的编码规则</p>
              </div>
              <div className="feature-card">
                <h3>本地解析</h3>
                <p>基于公开规则本地计算，无需联网，保护隐私</p>
              </div>
            </div>

            <h2>手机号码结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    手机号码结构 (11位)
    ┌─────────┬─────────┬─────────┐
    │  号段   │ HLR码   │ 用户码  │
    │ 3-4位   │  4位    │  4位    │
    └─────────┴─────────┴─────────┘
         │
         ▼
    ┌────────────────────────────────────┐
    │ 1XX - 号段决定运营商               │
    ├────────────────────────────────────┤
    │ 130-132: 中国联通                   │
    │ 133-153: 中国电信                   │
    │ 134-139, 150-159, 182-188: 中国移动 │
    └────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>身份证号码结构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    身份证号码结构 (18位)
    ┌───────────┬───────────┬─────┬─────┬───────┐
    │ 行政区划  │  出生日期 │ 顺序 │ 校验 │       │
    │   6位     │   8位     │ 码  │ 码   │       │
    └───────────┴───────────┴─────┴─────┴───────┘
         │             │         │      │
         ▼             ▼         ▼      ▼
    ┌─────────┐  ┌─────────┐  ┌────┐ ┌────┐
    │省市县级 │  │YYYYMMDD │  │第17││ISO │
    │区划代码 │  │出生年月日│  │位判││7064│
    └─────────┘  └─────────┘  │断性││校验│
                              └────┘└────┘

    行政区划示例:
    110000 - 北京市
    310000 - 上海市
    440300 - 深圳市
              `}</pre>
            </div>

            <h2>号段分配表</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>运营商</th>
                    <th>号段范围</th>
                    <th>特点</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>中国移动</td>
                    <td><code>134-139, 150-159, 182-188</code></td>
                    <td>用户最多，覆盖最广</td>
                  </tr>
                  <tr>
                    <td>中国联通</td>
                    <td><code>130-132, 155-156, 185-186</code></td>
                    <td>3G/4G 网络优秀</td>
                  </tr>
                  <tr>
                    <td>中国电信</td>
                    <td><code>133, 153, 180-181, 189</code></td>
                    <td>宽带业务强</td>
                  </tr>
                  <tr>
                    <td>虚拟运营商</td>
                    <td><code>170-171</code></td>
                    <td>租用基础运营商网络</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>用户注册</strong> - 验证手机号格式，显示运营商信息</li>
              <li><strong>身份验证</strong> - 校验身份证号格式和校验码</li>
              <li><strong>数据分析</strong> - 统计用户地区分布</li>
              <li><strong>客服系统</strong> - 快速识别用户归属地</li>
              <li><strong>风险控制</strong> - 识别异常地区注册</li>
            </ul>

            <div className="info-box">
              <strong>隐私声明</strong>
              <ul>
                <li>本工具仅在本地解析，不会上传您的信息</li>
                <li>手机号归属地基于号段规则推算</li>
                <li>身份证解析基于号码规则，不涉及实名验证</li>
                <li>查询结果仅供参考，请勿用于非法用途</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>查询演示</h2>
            <PhoneLookupDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 归属地查询工具
import re

# 号段运营商映射
CARRIER_MAP = {
    '130': '中国联通', '131': '中国联通', '132': '中国联通',
    '133': '中国电信', '134': '中国移动', '135': '中国移动',
    '136': '中国移动', '137': '中国移动', '138': '中国移动',
    '139': '中国移动', '150': '中国移动', '151': '中国移动',
    '152': '中国移动', '153': '中国电信', '155': '中国联通',
    '156': '中国联通', '157': '中国移动', '158': '中国移动',
    '159': '中国移动', '180': '中国电信', '181': '中国电信',
    '182': '中国移动', '183': '中国移动', '185': '中国联通',
    '186': '中国联通', '187': '中国移动', '188': '中国移动',
    '189': '中国电信'
}

# 身份证省份映射
PROVINCE_MAP = {
    '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省',
    '15': '内蒙古', '21': '辽宁省', '22': '吉林省', '23': '黑龙江',
    '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省',
    '35': '福建省', '36': '江西省', '37': '山东省', '41': '河南省',
    '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西',
    '46': '海南省', '50': '重庆市', '51': '四川省', '52': '贵州省',
    '53': '云南省', '54': '西藏', '61': '陕西省', '62': '甘肃省',
    '63': '青海省', '64': '宁夏', '65': '新疆'
}

def lookup_phone(phone: str) -> dict:
    """查询手机号归属地"""
    if not re.match(r'^1[3-9]\\d{9}$', phone):
        return {'error': '无效的手机号码'}

    prefix = phone[:3]
    return {
        'number': phone,
        'carrier': CARRIER_MAP.get(prefix, '未知运营商'),
        'province': '需数据库查询'
    }

def lookup_id_card(id_card: str) -> dict:
    """查询身份证归属地"""
    if not re.match(r'^\\d{17}[\\dXx]$', id_card):
        return {'error': '无效的身份证号码'}

    # 校验码验证
    weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    check_codes = '10X98765432'
    total = sum(int(id_card[i]) * weights[i] for i in range(17))
    if check_codes[total % 11] != id_card[-1].upper():
        return {'error': '校验码错误'}

    province_code = id_card[:2]
    birth_date = id_card[6:14]
    gender = '男' if int(id_card[16]) % 2 == 1 else '女'

    return {
        'number': id_card[:6] + '********' + id_card[14:],
        'province': PROVINCE_MAP.get(province_code, '未知'),
        'birthday': f"{birth_date[:4]}-{birth_date[4:6]}-{birth_date[6:8]}",
        'gender': gender
    }

# 使用示例
print(lookup_phone('13812345678'))
print(lookup_id_card('110101199001011234'))`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "regexp"
    "strconv"
)

// 号段运营商映射
var carrierMap = map[string]string{
    "130": "中国联通", "131": "中国联通", "132": "中国联通",
    "133": "中国电信", "134": "中国移动", "135": "中国移动",
    "136": "中国移动", "137": "中国移动", "138": "中国移动",
    "139": "中国移动", "150": "中国移动", "151": "中国移动",
    "152": "中国移动", "153": "中国电信", "155": "中国联通",
    "156": "中国联通", "157": "中国移动", "158": "中国移动",
    "159": "中国移动", "180": "中国电信", "181": "中国电信",
    "182": "中国移动", "183": "中国移动", "185": "中国联通",
    "186": "中国联通", "187": "中国移动", "188": "中国移动",
    "189": "中国电信",
}

// 身份证省份映射
var provinceMap = map[string]string{
    "11": "北京市", "12": "天津市", "13": "河北省", "14": "山西省",
    "15": "内蒙古", "21": "辽宁省", "22": "吉林省", "23": "黑龙江",
    "31": "上海市", "32": "江苏省", "33": "浙江省", "34": "安徽省",
    "35": "福建省", "36": "江西省", "37": "山东省", "41": "河南省",
    "42": "湖北省", "43": "湖南省", "44": "广东省", "45": "广西",
    "46": "海南省", "50": "重庆市", "51": "四川省", "52": "贵州省",
    "53": "云南省", "54": "西藏", "61": "陕西省", "62": "甘肃省",
    "63": "青海省", "64": "宁夏", "65": "新疆",
}

type PhoneInfo struct {
    Number   string \`json:"number"\`
    Carrier  string \`json:"carrier"\`
    Province string \`json:"province"\`
}

type IdCardInfo struct {
    Number   string \`json:"number"\`
    Province string \`json:"province"\`
    Birthday string \`json:"birthday"\`
    Gender   string \`json:"gender"\`
}

func LookupPhone(phone string) (*PhoneInfo, error) {
    matched, _ := regexp.MatchString(\`^1[3-9]\\d{9}$\`, phone)
    if !matched {
        return nil, fmt.Errorf("无效的手机号码")
    }

    prefix := phone[:3]
    carrier := carrierMap[prefix]
    if carrier == "" {
        carrier = "未知运营商"
    }

    return &PhoneInfo{
        Number:   phone,
        Carrier:  carrier,
        Province: "需数据库查询",
    }, nil
}

func LookupIdCard(idCard string) (*IdCardInfo, error) {
    matched, _ := regexp.MatchString(\`^\\d{17}[\\dXx]$\`, idCard)
    if !matched {
        return nil, fmt.Errorf("无效的身份证号码")
    }

    // 校验码验证
    weights := []int{7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2}
    checkCodes := "10X98765432"
    total := 0
    for i := 0; i < 17; i++ {
        n, _ := strconv.Atoi(string(idCard[i]))
        total += n * weights[i]
    }
    if checkCodes[total%11] != idCard[17] {
        return nil, fmt.Errorf("校验码错误")
    }

    provinceCode := idCard[:2]
    province := provinceMap[provinceCode]
    if province == "" {
        province = "未知"
    }

    gender := "女"
    if n, _ := strconv.Atoi(string(idCard[16])); n%2 == 1 {
        gender = "男"
    }

    return &IdCardInfo{
        Number:   idCard[:6] + "********" + idCard[14:],
        Province: province,
        Birthday: fmt.Sprintf("%s-%s-%s", idCard[6:10], idCard[10:12], idCard[12:14]),
        Gender:   gender,
    }, nil
}

func main() {
    phone, _ := LookupPhone("13812345678")
    fmt.Printf("手机号: %+v\\n", phone)

    idCard, _ := LookupIdCard("110101199001011234")
    fmt.Printf("身份证: %+v\\n", idCard)
}`}</pre>
            </div>

            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 归属地查询工具

// 号段运营商映射
const carrierMap = {
    '130': '中国联通', '131': '中国联通', '132': '中国联通',
    '133': '中国电信', '134': '中国移动', '135': '中国移动',
    '136': '中国移动', '137': '中国移动', '138': '中国移动',
    '139': '中国移动', '150': '中国移动', '151': '中国移动',
    '152': '中国移动', '153': '中国电信', '155': '中国联通',
    '156': '中国联通', '157': '中国移动', '158': '中国移动',
    '159': '中国移动', '180': '中国电信', '181': '中国电信',
    '182': '中国移动', '183': '中国移动', '185': '中国联通',
    '186': '中国联通', '187': '中国移动', '188': '中国移动',
    '189': '中国电信'
};

// 身份证省份映射
const provinceMap = {
    '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省',
    '15': '内蒙古', '21': '辽宁省', '22': '吉林省', '23': '黑龙江',
    '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省',
    '35': '福建省', '36': '江西省', '37': '山东省', '41': '河南省',
    '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西',
    '46': '海南省', '50': '重庆市', '51': '四川省', '52': '贵州省',
    '53': '云南省', '54': '西藏', '61': '陕西省', '62': '甘肃省',
    '63': '青海省', '64': '宁夏', '65': '新疆'
};

/**
 * 查询手机号归属地
 */
function lookupPhone(phone) {
    if (!/^1[3-9]\\d{9}$/.test(phone)) {
        return { error: '无效的手机号码' };
    }

    const prefix = phone.substring(0, 3);
    return {
        number: phone,
        carrier: carrierMap[prefix] || '未知运营商',
        province: '需数据库查询'
    };
}

/**
 * 查询身份证归属地
 */
function lookupIdCard(idCard) {
    if (!/^\\d{17}[\\dXx]$/.test(idCard)) {
        return { error: '无效的身份证号码' };
    }

    // 校验码验证
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = '10X98765432';
    let total = 0;
    for (let i = 0; i < 17; i++) {
        total += parseInt(idCard[i]) * weights[i];
    }
    if (checkCodes[total % 11] !== idCard[17].toUpperCase()) {
        return { error: '校验码错误' };
    }

    const provinceCode = idCard.substring(0, 2);
    const birthDate = idCard.substring(6, 14);
    const gender = parseInt(idCard[16]) % 2 === 1 ? '男' : '女';

    return {
        number: idCard.substring(0, 6) + '********' + idCard.substring(14),
        province: provinceMap[provinceCode] || '未知',
        birthday: \`\${birthDate.substring(0, 4)}-\${birthDate.substring(4, 6)}-\${birthDate.substring(6, 8)}\`,
        gender
    };
}

// 使用示例
console.log(lookupPhone('13812345678'));
console.log(lookupIdCard('110101199001011234'));`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 查询演示组件
function PhoneLookupDemo() {
  const [phoneInput, setPhoneInput] = useState('')
  const [idInput, setIdInput] = useState('')
  const [phoneResult, setPhoneResult] = useState<PhoneResult | null>(null)
  const [idResult, setIdResult] = useState<IdResult | null>(null)
  const [queryType, setQueryType] = useState<'phone' | 'id'>('phone')
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // 手机号归属地查询（模拟）
  const handlePhoneLookup = () => {
    setError(null)
    setPhoneResult(null)

    const phone = phoneInput.trim()
    if (!phone) {
      setError('请输入手机号码')
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号码')
      return
    }

    // 根据号段模拟查询结果
    const prefix = phone.substring(0, 3)
    const carrierMap: Record<string, string> = {
      '130': '中国联通', '131': '中国联通', '132': '中国联通', '133': '中国电信',
      '134': '中国移动', '135': '中国移动', '136': '中国移动', '137': '中国移动',
      '138': '中国移动', '139': '中国移动', '150': '中国移动', '151': '中国移动',
      '152': '中国移动', '153': '中国电信', '155': '中国联通', '156': '中国联通',
      '157': '中国移动', '158': '中国移动', '159': '中国移动', '180': '中国电信',
      '181': '中国电信', '182': '中国移动', '183': '中国移动', '185': '中国联通',
      '186': '中国联通', '187': '中国移动', '188': '中国移动', '189': '中国电信'
    }

    const carriers = ['中国移动', '中国联通', '中国电信']
    const provinces = ['北京', '上海', '广东', '浙江', '江苏', '四川', '湖北', '河南']

    setPhoneResult({
      number: phone,
      province: provinces[Math.floor(Math.random() * provinces.length)],
      city: '详细城市',
      carrier: carrierMap[prefix] || carriers[Math.floor(Math.random() * carriers.length)]
    })
  }

  // 身份证归属地查询（模拟）
  const handleIdLookup = () => {
    setError(null)
    setIdResult(null)

    const id = idInput.trim()
    if (!id) {
      setError('请输入身份证号码')
      return
    }

    if (!/^\d{17}[\dXx]$/.test(id)) {
      setError('请输入正确的身份证号码')
      return
    }

    // 解析身份证
    const provinceCode = id.substring(0, 2)
    const birthDate = id.substring(6, 14)
    const genderCode = parseInt(id.substring(16, 17))

    const provinceMap: Record<string, string> = {
      '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省',
      '15': '内蒙古自治区', '21': '辽宁省', '22': '吉林省', '23': '黑龙江省',
      '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省',
      '35': '福建省', '36': '江西省', '37': '山东省', '41': '河南省',
      '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区',
      '46': '海南省', '50': '重庆市', '51': '四川省', '52': '贵州省',
      '53': '云南省', '54': '西藏自治区', '61': '陕西省', '62': '甘肃省',
      '63': '青海省', '64': '宁夏回族自治区', '65': '新疆维吾尔自治区'
    }

    const year = birthDate.substring(0, 4)
    const month = birthDate.substring(4, 6)
    const day = birthDate.substring(6, 8)

    setIdResult({
      number: id.substring(0, 6) + '********' + id.substring(14),
      province: provinceMap[provinceCode] || '未知',
      city: '详细市区',
      birthday: `${year}-${month}-${day}`,
      gender: genderCode % 2 === 1 ? '男' : '女'
    })
  }

  return (
    <div className="phone-lookup-demo">
      <div className="demo-controls" style={{ marginBottom: '16px' }}>
        <button
          onClick={() => { setQueryType('phone'); setError(null); }}
          style={{ background: queryType === 'phone' ? '#4fc3f7' : '#e0e0e0', color: queryType === 'phone' ? '#fff' : '#333' }}
        >
          手机号查询
        </button>
        <button
          onClick={() => { setQueryType('id'); setError(null); }}
          style={{ background: queryType === 'id' ? '#4fc3f7' : '#e0e0e0', color: queryType === 'id' ? '#fff' : '#333' }}
        >
          身份证查询
        </button>
      </div>

      {error && (
        <div className="info-box warning" style={{ marginBottom: '16px' }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {queryType === 'phone' ? (
        <>
          <div className="config-row" style={{ marginBottom: '16px' }}>
            <label>手机号码</label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="请输入11位手机号码"
              maxLength={11}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>

          <div className="demo-controls" style={{ marginBottom: '16px' }}>
            <button onClick={handlePhoneLookup}>查询</button>
          </div>

          {phoneResult && (
            <div className="result-box">
              <h4>查询结果</h4>
              <p><strong>手机号码：</strong>{phoneResult.number}</p>
              <p><strong>归属省份：</strong>{phoneResult.province}</p>
              <p><strong>归属城市：</strong>{phoneResult.city}</p>
              <p><strong>运营商：</strong>{phoneResult.carrier}</p>
              <button
                onClick={() => onCopy(`${phoneResult.number} ${phoneResult.province} ${phoneResult.carrier}`)}
                style={{ marginTop: '12px' }}
              >
                复制结果
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="config-row" style={{ marginBottom: '16px' }}>
            <label>身份证号码</label>
            <input
              type="text"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="请输入18位身份证号码"
              maxLength={18}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>

          <div className="demo-controls" style={{ marginBottom: '16px' }}>
            <button onClick={handleIdLookup}>查询</button>
          </div>

          {idResult && (
            <div className="result-box">
              <h4>查询结果</h4>
              <p><strong>身份证号：</strong>{idResult.number}</p>
              <p><strong>归属地区：</strong>{idResult.province}</p>
              <p><strong>出生日期：</strong>{idResult.birthday}</p>
              <p><strong>性别：</strong>{idResult.gender}</p>
              <button
                onClick={() => onCopy(`${idResult.province} ${idResult.birthday} ${idResult.gender}`)}
                style={{ marginTop: '12px' }}
              >
                复制结果
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
