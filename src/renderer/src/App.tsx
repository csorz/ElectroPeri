import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

// P0 - 全栈工具箱 - Category pages
import EncodingCategoryPage from './pages/toolbox/categories/EncodingCategoryPage'
import JsonCategoryPage from './pages/toolbox/categories/JsonCategoryPage'
import UrlCategoryPage from './pages/toolbox/categories/UrlCategoryPage'
import TimeCategoryPage from './pages/toolbox/categories/TimeCategoryPage'
import HttpCategoryPage from './pages/toolbox/categories/HttpCategoryPage'
import TextCategoryPage from './pages/toolbox/categories/TextCategoryPage'
import ColorCategoryPage from './pages/toolbox/categories/ColorCategoryPage'
import CssCategoryPage from './pages/toolbox/categories/CssCategoryPage'
import ImageCategoryPage from './pages/toolbox/categories/ImageCategoryPage'
import MarkdownCategoryPage from './pages/toolbox/categories/MarkdownCategoryPage'
import CodeCategoryPage from './pages/toolbox/categories/CodeCategoryPage'
import DevCategoryPage from './pages/toolbox/categories/DevCategoryPage'
import SeoCategoryPage from './pages/toolbox/categories/SeoCategoryPage'
import OcrCategoryPage from './pages/toolbox/categories/OcrCategoryPage'
import UtilsCategoryPage from './pages/toolbox/categories/UtilsCategoryPage'
import FunCategoryPage from './pages/toolbox/categories/FunCategoryPage'

// Network Category
import NetworkCategoryPage from './pages/toolbox/categories/NetworkCategoryPage'
import TcpToolPage from './pages/toolbox/tools/TcpToolPage'
import UdpToolPage from './pages/toolbox/tools/UdpToolPage'
import KcpToolPage from './pages/toolbox/tools/KcpToolPage'

// Database Category
import DatabaseCategoryPage from './pages/toolbox/categories/DatabaseCategoryPage'
import MysqlToolPage from './pages/toolbox/tools/MysqlToolPage'
import PostgresqlToolPage from './pages/toolbox/tools/PostgresqlToolPage'
import MongodbToolPage from './pages/toolbox/tools/MongodbToolPage'
import ShardingToolPage from './pages/toolbox/tools/ShardingToolPage'
import IndexToolPage from './pages/toolbox/tools/IndexToolPage'
import ReplicationToolPage from './pages/toolbox/tools/ReplicationToolPage'

// Pool Category
import PoolCategoryPage from './pages/toolbox/categories/PoolCategoryPage'
import ConnectionPoolToolPage from './pages/toolbox/tools/ConnectionPoolToolPage'
import ThreadPoolToolPage from './pages/toolbox/tools/ThreadPoolToolPage'
import ObjectPoolToolPage from './pages/toolbox/tools/ObjectPoolToolPage'

// Redis Category
import RedisCategoryPage from './pages/toolbox/categories/RedisCategoryPage'
import RedisCacheToolPage from './pages/toolbox/tools/RedisCacheToolPage'
import RedisProblemsToolPage from './pages/toolbox/tools/RedisProblemsToolPage'
import RedisResilienceToolPage from './pages/toolbox/tools/RedisResilienceToolPage'

// Deploy Category
import DeployCategoryPage from './pages/toolbox/categories/DeployCategoryPage'
import DeployArchitectureToolPage from './pages/toolbox/tools/DeployArchitectureToolPage'
import LinuxToolPage from './pages/toolbox/tools/LinuxToolPage'
import DockerToolPage from './pages/toolbox/tools/DockerToolPage'
import KubernetesToolPage from './pages/toolbox/tools/KubernetesToolPage'
import SecurityToolPage from './pages/toolbox/tools/SecurityToolPage'

// Monitor Category
import MonitorCategoryPage from './pages/toolbox/categories/MonitorCategoryPage'
import GrafanaToolPage from './pages/toolbox/tools/GrafanaToolPage'

// Release Category
import ReleaseCategoryPage from './pages/toolbox/categories/ReleaseCategoryPage'
import CanaryToolPage from './pages/toolbox/tools/CanaryToolPage'
import BlueGreenToolPage from './pages/toolbox/tools/BlueGreenToolPage'
import RollingToolPage from './pages/toolbox/tools/RollingToolPage'

// Scaling Category
import ScalingCategoryPage from './pages/toolbox/categories/ScalingCategoryPage'
import MultiActiveToolPage from './pages/toolbox/tools/MultiActiveToolPage'
import BackupToolPage from './pages/toolbox/tools/BackupToolPage'

// HA Category
import HaCategoryPage from './pages/toolbox/categories/HaCategoryPage'
import LoadbalancerToolPage from './pages/toolbox/tools/LoadbalancerToolPage'
import DnsToolPage from './pages/toolbox/tools/DnsToolPage'
import ProxyToolPage from './pages/toolbox/tools/ProxyToolPage'
import CdnToolPage from './pages/toolbox/tools/CdnToolPage'

// Encoding tools
import HashToolPage from './pages/toolbox/tools/HashToolPage'
import Base64ToolPage from './pages/toolbox/tools/Base64ToolPage'
import UrlToolPage from './pages/toolbox/tools/UrlToolPage'
import EncryptToolPage from './pages/toolbox/tools/EncryptToolPage'
import UnicodeToolPage from './pages/toolbox/tools/UnicodeToolPage'

// JSON tools
import JsonFormatToolPage from './pages/toolbox/tools/JsonFormatToolPage'
import JsonMinifyToolPage from './pages/toolbox/tools/JsonMinifyToolPage'
import JsonValidateToolPage from './pages/toolbox/tools/JsonValidateToolPage'
import JsonToYamlToolPage from './pages/toolbox/tools/JsonToYamlToolPage'
import JsonToCsvToolPage from './pages/toolbox/tools/JsonToCsvToolPage'

// URL tools
import ShortUrlToolPage from './pages/toolbox/tools/ShortUrlToolPage'
import QueryParserToolPage from './pages/toolbox/tools/QueryParserToolPage'

// Time tools
import TimestampToolPage from './pages/toolbox/tools/TimestampToolPage'
import CurrentTimeToolPage from './pages/toolbox/tools/CurrentTimeToolPage'
import TimezoneToolPage from './pages/toolbox/tools/TimezoneToolPage'

// HTTP tools
import HttpRequestToolPage from './pages/toolbox/tools/HttpRequestToolPage'
import WebSocketToolPage from './pages/toolbox/tools/WebSocketToolPage'
import HttpStatusToolPage from './pages/toolbox/tools/HttpStatusToolPage'
import MqttToolPage from './pages/toolbox/tools/MqttToolPage'

// Text tools
import RegexToolPage from './pages/toolbox/tools/RegexToolPage'
import TextDiffToolPage from './pages/toolbox/tools/TextDiffToolPage'
import CsvJsonToolPage from './pages/toolbox/tools/CsvJsonToolPage'
import YamlJsonToolPage from './pages/toolbox/tools/YamlJsonToolPage'
import WordCountToolPage from './pages/toolbox/tools/WordCountToolPage'

// Color tools
import ColorConvertToolPage from './pages/toolbox/tools/ColorConvertToolPage'
import ColorPaletteToolPage from './pages/toolbox/tools/ColorPaletteToolPage'
import GradientGeneratorToolPage from './pages/toolbox/tools/GradientGeneratorToolPage'
import ContrastToolPage from './pages/toolbox/tools/ContrastToolPage'
import ColorPickerToolPage from './pages/toolbox/tools/ColorPickerToolPage'

// CSS tools
import ShadowGeneratorToolPage from './pages/toolbox/tools/ShadowGeneratorToolPage'
import ButtonDesignerToolPage from './pages/toolbox/tools/ButtonDesignerToolPage'
import GridGeneratorToolPage from './pages/toolbox/tools/GridGeneratorToolPage'
import BackgroundGeneratorToolPage from './pages/toolbox/tools/BackgroundGeneratorToolPage'
import CssFormatToolPage from './pages/toolbox/tools/CssFormatToolPage'

// Image tools
import ImageCompressToolPage from './pages/toolbox/tools/ImageCompressToolPage'
import ImageConvertToolPage from './pages/toolbox/tools/ImageConvertToolPage'
import ImageBase64ToolPage from './pages/toolbox/tools/ImageBase64ToolPage'
import WatermarkToolPage from './pages/toolbox/tools/WatermarkToolPage'
import QrCodeToolPage from './pages/toolbox/tools/QrCodeToolPage'

// Markdown tools
import MarkdownEditorToolPage from './pages/toolbox/tools/MarkdownEditorToolPage'
import MarkdownTableToolPage from './pages/toolbox/tools/MarkdownTableToolPage'
import HtmlMdToolPage from './pages/toolbox/tools/HtmlMdToolPage'

// Code tools
import JsRunnerToolPage from './pages/toolbox/tools/JsRunnerToolPage'
import PythonRunnerToolPage from './pages/toolbox/tools/PythonRunnerToolPage'
import JavaRunnerToolPage from './pages/toolbox/tools/JavaRunnerToolPage'
import GoRunnerToolPage from './pages/toolbox/tools/GoRunnerToolPage'
import RustRunnerToolPage from './pages/toolbox/tools/RustRunnerToolPage'

// Dev tools
import UuidGeneratorToolPage from './pages/toolbox/tools/UuidGeneratorToolPage'
import JwtToolPage from './pages/toolbox/tools/JwtToolPage'
import CronGeneratorToolPage from './pages/toolbox/tools/CronGeneratorToolPage'
import RandomPasswordToolPage from './pages/toolbox/tools/RandomPasswordToolPage'

// SEO tools
import IpQueryToolPage from './pages/toolbox/tools/IpQueryToolPage'
import WhoisToolPage from './pages/toolbox/tools/WhoisToolPage'
import MetaCheckerToolPage from './pages/toolbox/tools/MetaCheckerToolPage'
import DnsQueryToolPage from './pages/toolbox/tools/DnsQueryToolPage'

// OCR tools
import OcrToolPage from './pages/toolbox/tools/OcrToolPage'
import SvgEditorToolPage from './pages/toolbox/tools/SvgEditorToolPage'

// Utils tools
import VideoParserToolPage from './pages/toolbox/tools/VideoParserToolPage'
import FileTransferToolPage from './pages/toolbox/tools/FileTransferToolPage'
import PhoneLookupToolPage from './pages/toolbox/tools/PhoneLookupToolPage'

// Fun tools
import PianoToolPage from './pages/toolbox/tools/PianoToolPage'
import VoiceSynthesisToolPage from './pages/toolbox/tools/VoiceSynthesisToolPage'
import AvatarGeneratorToolPage from './pages/toolbox/tools/AvatarGeneratorToolPage'

// P1 - 工业核心接口
import SerialPage from './pages/industrial/SerialPage'
import WebSerialPage from './pages/industrial/WebSerialPage'
import WebHidPage from './pages/industrial/WebHidPage'
import WebUsbPage from './pages/industrial/WebUsbPage'
import WebBluetoothPage from './pages/industrial/WebBluetoothPage'
import UsbPage from './pages/industrial/UsbPage'
import BluetoothPage from './pages/industrial/BluetoothPage'
import HidPage from './pages/industrial/HidPage'
import NetworkPage from './pages/industrial/NetworkPage'

// P2 - 系统与终端能力
import SystemPage from './pages/system/SystemPage'
import StoragePage from './pages/system/StoragePage'
import DisplayPage from './pages/system/DisplayPage'
import PowerPage from './pages/system/PowerPage'
import ProcessPage from './pages/system/ProcessPage'
import PrinterPage from './pages/system/PrinterPage'
import MediaPage from './pages/system/MediaPage'

// P4 - 嵌入式扩展接口
import GpioPage from './pages/embedded/GpioPage'
import I2cPage from './pages/embedded/I2cPage'
import SpiPage from './pages/embedded/SpiPage'
import OnewirePage from './pages/embedded/OnewirePage'

import './assets/main.css'

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="serial" element={<SerialPage />} />
          <Route path="usb" element={<UsbPage />} />
          <Route path="bluetooth" element={<BluetoothPage />} />
          <Route path="hid" element={<HidPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="gpio" element={<GpioPage />} />
          <Route path="i2c" element={<I2cPage />} />
          <Route path="spi" element={<SpiPage />} />
          <Route path="onewire" element={<OnewirePage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="display" element={<DisplayPage />} />
          <Route path="power" element={<PowerPage />} />
          <Route path="process" element={<ProcessPage />} />
          <Route path="printer" element={<PrinterPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="web-serial" element={<WebSerialPage />} />
          <Route path="web-hid" element={<WebHidPage />} />
          <Route path="web-usb" element={<WebUsbPage />} />
          <Route path="web-bluetooth" element={<WebBluetoothPage />} />

          {/* Encoding Category & Tools */}
          <Route path="frontend-toolbox/encoding" element={<EncodingCategoryPage />} />
          <Route path="frontend-toolbox/encoding/hash" element={<HashToolPage />} />
          <Route path="frontend-toolbox/encoding/base64" element={<Base64ToolPage />} />
          <Route path="frontend-toolbox/encoding/url" element={<UrlToolPage />} />
          <Route path="frontend-toolbox/encoding/encrypt" element={<EncryptToolPage />} />
          <Route path="frontend-toolbox/encoding/unicode" element={<UnicodeToolPage />} />

          {/* JSON Category & Tools */}
          <Route path="frontend-toolbox/json" element={<JsonCategoryPage />} />
          <Route path="frontend-toolbox/json/format" element={<JsonFormatToolPage />} />
          <Route path="frontend-toolbox/json/minify" element={<JsonMinifyToolPage />} />
          <Route path="frontend-toolbox/json/validate" element={<JsonValidateToolPage />} />
          <Route path="frontend-toolbox/json/to-yaml" element={<JsonToYamlToolPage />} />
          <Route path="frontend-toolbox/json/to-csv" element={<JsonToCsvToolPage />} />

          {/* URL Category & Tools */}
          <Route path="frontend-toolbox/url" element={<UrlCategoryPage />} />
          <Route path="frontend-toolbox/url/encode" element={<UrlToolPage />} />
          <Route path="frontend-toolbox/url/short" element={<ShortUrlToolPage />} />
          <Route path="frontend-toolbox/url/query" element={<QueryParserToolPage />} />

          {/* Time Category & Tools */}
          <Route path="frontend-toolbox/time" element={<TimeCategoryPage />} />
          <Route path="frontend-toolbox/time/stamp" element={<TimestampToolPage />} />
          <Route path="frontend-toolbox/time/now" element={<CurrentTimeToolPage />} />
          <Route path="frontend-toolbox/time/timezone" element={<TimezoneToolPage />} />

          {/* HTTP Category & Tools */}
          <Route path="frontend-toolbox/http" element={<HttpCategoryPage />} />
          <Route path="frontend-toolbox/http/request" element={<HttpRequestToolPage />} />
          <Route path="frontend-toolbox/http/websocket" element={<WebSocketToolPage />} />
          <Route path="frontend-toolbox/http/mqtt" element={<MqttToolPage />} />
          <Route path="frontend-toolbox/http/status" element={<HttpStatusToolPage />} />

          {/* Text Category & Tools */}
          <Route path="frontend-toolbox/text" element={<TextCategoryPage />} />
          <Route path="frontend-toolbox/text/regex" element={<RegexToolPage />} />
          <Route path="frontend-toolbox/text/diff" element={<TextDiffToolPage />} />
          <Route path="frontend-toolbox/text/csv-json" element={<CsvJsonToolPage />} />
          <Route path="frontend-toolbox/text/yaml-json" element={<YamlJsonToolPage />} />
          <Route path="frontend-toolbox/text/count" element={<WordCountToolPage />} />

          {/* Color Category & Tools */}
          <Route path="frontend-toolbox/color" element={<ColorCategoryPage />} />
          <Route path="frontend-toolbox/color/convert" element={<ColorConvertToolPage />} />
          <Route path="frontend-toolbox/color/palette" element={<ColorPaletteToolPage />} />
          <Route path="frontend-toolbox/color/gradient" element={<GradientGeneratorToolPage />} />
          <Route path="frontend-toolbox/color/contrast" element={<ContrastToolPage />} />
          <Route path="frontend-toolbox/color/picker" element={<ColorPickerToolPage />} />

          {/* CSS Category & Tools */}
          <Route path="frontend-toolbox/css" element={<CssCategoryPage />} />
          <Route path="frontend-toolbox/css/shadow" element={<ShadowGeneratorToolPage />} />
          <Route path="frontend-toolbox/css/button" element={<ButtonDesignerToolPage />} />
          <Route path="frontend-toolbox/css/grid" element={<GridGeneratorToolPage />} />
          <Route path="frontend-toolbox/css/background" element={<BackgroundGeneratorToolPage />} />
          <Route path="frontend-toolbox/css/format" element={<CssFormatToolPage />} />

          {/* Image Category & Tools */}
          <Route path="frontend-toolbox/image" element={<ImageCategoryPage />} />
          <Route path="frontend-toolbox/image/compress" element={<ImageCompressToolPage />} />
          <Route path="frontend-toolbox/image/convert" element={<ImageConvertToolPage />} />
          <Route path="frontend-toolbox/image/base64" element={<ImageBase64ToolPage />} />
          <Route path="frontend-toolbox/image/watermark" element={<WatermarkToolPage />} />
          <Route path="frontend-toolbox/image/qrcode" element={<QrCodeToolPage />} />

          {/* Markdown Category & Tools */}
          <Route path="frontend-toolbox/markdown" element={<MarkdownCategoryPage />} />
          <Route path="frontend-toolbox/markdown/editor" element={<MarkdownEditorToolPage />} />
          <Route path="frontend-toolbox/markdown/table" element={<MarkdownTableToolPage />} />
          <Route path="frontend-toolbox/markdown/html-md" element={<HtmlMdToolPage />} />

          {/* Code Category & Tools */}
          <Route path="frontend-toolbox/code" element={<CodeCategoryPage />} />
          <Route path="frontend-toolbox/code/js" element={<JsRunnerToolPage />} />
          <Route path="frontend-toolbox/code/python" element={<PythonRunnerToolPage />} />
          <Route path="frontend-toolbox/code/java" element={<JavaRunnerToolPage />} />
          <Route path="frontend-toolbox/code/go" element={<GoRunnerToolPage />} />
          <Route path="frontend-toolbox/code/rust" element={<RustRunnerToolPage />} />

          {/* Dev Category & Tools */}
          <Route path="frontend-toolbox/dev" element={<DevCategoryPage />} />
          <Route path="frontend-toolbox/dev/uuid" element={<UuidGeneratorToolPage />} />
          <Route path="frontend-toolbox/dev/jwt" element={<JwtToolPage />} />
          <Route path="frontend-toolbox/dev/cron" element={<CronGeneratorToolPage />} />
          <Route path="frontend-toolbox/dev/random" element={<RandomPasswordToolPage />} />

          {/* SEO Category & Tools */}
          <Route path="frontend-toolbox/seo" element={<SeoCategoryPage />} />
          <Route path="frontend-toolbox/seo/ip" element={<IpQueryToolPage />} />
          <Route path="frontend-toolbox/seo/whois" element={<WhoisToolPage />} />
          <Route path="frontend-toolbox/seo/meta" element={<MetaCheckerToolPage />} />
          <Route path="frontend-toolbox/seo/dns" element={<DnsQueryToolPage />} />

          {/* OCR Category & Tools */}
          <Route path="frontend-toolbox/ocr" element={<OcrCategoryPage />} />
          <Route path="frontend-toolbox/ocr/text" element={<OcrToolPage />} />
          <Route path="frontend-toolbox/ocr/svg" element={<SvgEditorToolPage />} />

          {/* Utils Category & Tools */}
          <Route path="frontend-toolbox/utils" element={<UtilsCategoryPage />} />
          <Route path="frontend-toolbox/utils/video" element={<VideoParserToolPage />} />
          <Route path="frontend-toolbox/utils/file" element={<FileTransferToolPage />} />
          <Route path="frontend-toolbox/utils/phone" element={<PhoneLookupToolPage />} />

          {/* Fun Category & Tools */}
          <Route path="frontend-toolbox/fun" element={<FunCategoryPage />} />
          <Route path="frontend-toolbox/fun/piano" element={<PianoToolPage />} />
          <Route path="frontend-toolbox/fun/voice" element={<VoiceSynthesisToolPage />} />
          <Route path="frontend-toolbox/fun/avatar" element={<AvatarGeneratorToolPage />} />

          {/* Network Category & Tools */}
          <Route path="frontend-toolbox/network" element={<NetworkCategoryPage />} />
          <Route path="frontend-toolbox/network/tcp" element={<TcpToolPage />} />
          <Route path="frontend-toolbox/network/udp" element={<UdpToolPage />} />
          <Route path="frontend-toolbox/network/kcp" element={<KcpToolPage />} />

          {/* Database Category & Tools */}
          <Route path="frontend-toolbox/database" element={<DatabaseCategoryPage />} />
          <Route path="frontend-toolbox/database/mysql" element={<MysqlToolPage />} />
          <Route path="frontend-toolbox/database/postgresql" element={<PostgresqlToolPage />} />
          <Route path="frontend-toolbox/database/mongodb" element={<MongodbToolPage />} />
          <Route path="frontend-toolbox/database/sharding" element={<ShardingToolPage />} />
          <Route path="frontend-toolbox/database/index" element={<IndexToolPage />} />
          <Route path="frontend-toolbox/database/replication" element={<ReplicationToolPage />} />

          {/* Pool Category & Tools */}
          <Route path="frontend-toolbox/pool" element={<PoolCategoryPage />} />
          <Route path="frontend-toolbox/pool/connection" element={<ConnectionPoolToolPage />} />
          <Route path="frontend-toolbox/pool/thread" element={<ThreadPoolToolPage />} />
          <Route path="frontend-toolbox/pool/object" element={<ObjectPoolToolPage />} />

          {/* Redis Category & Tools */}
          <Route path="frontend-toolbox/redis" element={<RedisCategoryPage />} />
          <Route path="frontend-toolbox/redis/cache" element={<RedisCacheToolPage />} />
          <Route path="frontend-toolbox/redis/problems" element={<RedisProblemsToolPage />} />
          <Route path="frontend-toolbox/redis/resilience" element={<RedisResilienceToolPage />} />

          {/* Deploy Category & Tools */}
          <Route path="frontend-toolbox/deploy" element={<DeployCategoryPage />} />
          <Route path="frontend-toolbox/deploy/architecture" element={<DeployArchitectureToolPage />} />
          <Route path="frontend-toolbox/deploy/linux" element={<LinuxToolPage />} />
          <Route path="frontend-toolbox/deploy/docker" element={<DockerToolPage />} />
          <Route path="frontend-toolbox/deploy/kubernetes" element={<KubernetesToolPage />} />
          <Route path="frontend-toolbox/deploy/security" element={<SecurityToolPage />} />

          {/* Monitor Category & Tools */}
          <Route path="frontend-toolbox/monitor" element={<MonitorCategoryPage />} />
          <Route path="frontend-toolbox/monitor/grafana" element={<GrafanaToolPage />} />

          {/* Release Category & Tools */}
          <Route path="frontend-toolbox/release" element={<ReleaseCategoryPage />} />
          <Route path="frontend-toolbox/release/canary" element={<CanaryToolPage />} />
          <Route path="frontend-toolbox/release/blue-green" element={<BlueGreenToolPage />} />
          <Route path="frontend-toolbox/release/rolling" element={<RollingToolPage />} />

          {/* Scaling Category & Tools */}
          <Route path="frontend-toolbox/scaling" element={<ScalingCategoryPage />} />
          <Route path="frontend-toolbox/scaling/multi-active" element={<MultiActiveToolPage />} />
          <Route path="frontend-toolbox/scaling/backup" element={<BackupToolPage />} />

          {/* HA Category & Tools */}
          <Route path="frontend-toolbox/ha" element={<HaCategoryPage />} />
          <Route path="frontend-toolbox/ha/loadbalancer" element={<LoadbalancerToolPage />} />
          <Route path="frontend-toolbox/ha/dns" element={<DnsToolPage />} />
          <Route path="frontend-toolbox/ha/proxy" element={<ProxyToolPage />} />
          <Route path="frontend-toolbox/ha/cdn" element={<CdnToolPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
