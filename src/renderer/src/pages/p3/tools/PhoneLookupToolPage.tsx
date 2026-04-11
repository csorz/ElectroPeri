import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

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
  const [phoneInput, setPhoneInput] = useState('')
  const [idInput, setIdInput] = useState('')
  const [phoneResult, setPhoneResult] = useState<PhoneResult | null>(null)
  const [idResult, setIdResult] = useState<IdResult | null>(null)
  const [activeTab, setActiveTab] = useState<'phone' | 'id'>('phone')
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
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/utils" className="toolbox-back">
        ← 返回实用工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📱</span>
          <h1>归属地查询</h1>
        </div>
        <p className="page-sub">查询手机号码和身份证号码归属地</p>
      </div>

      <section className="tool-card">
        <div className="tool-row" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('phone'); setError(null); }}
          >
            手机号查询
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'id' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('id'); setError(null); }}
          >
            身份证查询
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}

        {activeTab === 'phone' ? (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">输入手机号码</div>
              <input
                type="text"
                className="tool-input"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="请输入11位手机号码"
                maxLength={11}
              />
              <div className="tool-actions">
                <button type="button" className="btn btn-primary" onClick={handlePhoneLookup}>
                  查询
                </button>
              </div>
            </div>

            {phoneResult && (
              <div className="tool-block">
                <div className="tool-block-title">查询结果</div>
                <div className="tool-result">
                  <p><strong>手机号码：</strong>{phoneResult.number}</p>
                  <p><strong>归属省份：</strong>{phoneResult.province}</p>
                  <p><strong>归属城市：</strong>{phoneResult.city}</p>
                  <p><strong>运营商：</strong>{phoneResult.carrier}</p>
                </div>
                <div className="tool-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onCopy(`${phoneResult.number} ${phoneResult.province} ${phoneResult.carrier}`)}
                  >
                    复制结果
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="tool-block-title">输入身份证号码</div>
              <input
                type="text"
                className="tool-input"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="请输入18位身份证号码"
                maxLength={18}
              />
              <div className="tool-actions">
                <button type="button" className="btn btn-primary" onClick={handleIdLookup}>
                  查询
                </button>
              </div>
            </div>

            {idResult && (
              <div className="tool-block">
                <div className="tool-block-title">查询结果</div>
                <div className="tool-result">
                  <p><strong>身份证号：</strong>{idResult.number}</p>
                  <p><strong>归属地区：</strong>{idResult.province}</p>
                  <p><strong>出生日期：</strong>{idResult.birthday}</p>
                  <p><strong>性别：</strong>{idResult.gender}</p>
                </div>
                <div className="tool-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onCopy(`${idResult.province} ${idResult.birthday} ${idResult.gender}`)}
                  >
                    复制结果
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="tool-block">
          <div className="tool-block-title">隐私声明</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>本工具仅在本地解析，不会上传您的信息</li>
              <li>手机号归属地基于号段规则推算</li>
              <li>身份证解析基于号码规则，不涉及实名验证</li>
              <li>查询结果仅供参考，请勿用于非法用途</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
