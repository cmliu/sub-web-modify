<template>
  <div class="subconverter-page">
    <button class="theme-toggle-glass" type="button" @click="change" aria-label="切换主题">
      <i :class="currentTheme === 'dark-mode' ? 'el-icon-sunny' : 'el-icon-moon'"></i>
    </button>
    <button class="performance-toggle-glass" :class="{ active: performanceMode }" type="button" @click="togglePerformanceMode" aria-label="性能模式">
      <i :class="performanceMode ? 'el-icon-cpu' : 'el-icon-connection'"></i>
    </button>

    <div class="app-container">
      <header class="glass-header glass-card">
        <div class="header-content">
          <h1 class="header-title">订阅转换</h1>
        </div>
        <div class="header-meta">
          <el-tag v-if="backendVersion" size="medium" effect="dark" class="version-tag">
            后端版本：{{ backendVersion }}
          </el-tag>
          <el-tag v-else size="medium" effect="dark" class="version-tag">
            正在检测后端版本…
          </el-tag>
        </div>
      </header>

      <div class="glass-main">
        <section class="form-section glass-card">
          <div class="section-header">
            <h2 class="section-title">参数配置</h2>
            <p class="section-subtitle">填写订阅来源与转换参数，系统将自动构建最优输出</p>
          </div>

          <el-form :model="form" label-width="108px" label-position="left" class="form-stack">
            <el-form-item label="订阅链接">
              <el-input
                v-model="form.sourceSubUrl"
                type="textarea"
                :rows="3"
                class="text-wrap"
                placeholder="支持各种订阅链接或单节点链接，多个链接使用换行或 | 分隔">
              </el-input>
            </el-form-item>

            <el-form-item label="生成类型">
              <el-select v-model="form.clientType" filterable placeholder="请选择客户端类型" clearable>
                <el-option
                  v-for="(v, k) in options.clientTypes"
                  :key="k"
                  :label="k"
                  :value="v">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="后端地址">
              <el-select
                v-model="form.customBackend"
                filterable
                placeholder="请选择后端地址"
                @change="handleBackendChange"
                clearable>
                <el-option
                  v-for="(v, k) in options.customBackend"
                  :key="k"
                  :label="k"
                  :value="v">
                </el-option>
                <el-option label="自定义..." value="__custom__"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="短链选择">
              <el-select
                v-model="form.shortType"
                filterable
                placeholder="请选择短链服务"
                clearable>
                <el-option
                  v-for="(v, k) in options.shortTypes"
                  :key="k"
                  :label="k"
                  :value="v">
                </el-option>
              </el-select>
              <div class="form-helper-text" v-if="form.shortType && form.shortType.includes('v1.mk')">该服务可能需要token</div>
            </el-form-item>

            <el-form-item label="远程配置">
              <el-select
                v-model="form.remoteConfig"
                filterable
                placeholder="请选择远程配置"
                @change="handleRemoteConfigChange"
                clearable>
                <el-option-group v-for="group in options.remoteConfig" :key="group.label" :label="group.label">
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-option-group>
                <el-option label="管理配置..." value="__manage__"></el-option>
              </el-select>
            </el-form-item>

            <div class="advanced-panel">
              <el-form-item label-width="0px">
                <!-- Desktop Collapse -->
                <el-collapse>
                  <el-collapse-item>
                    <template #title>
                      <div class="advanced-toggle">
                        <i class="el-icon-setting"></i>
                        高级功能
                      </div>
                    </template>

                    <!-- 高级选项内容 -->
                    <div class="advanced-content">
                      <el-form-item label="包含节点">
                        <el-input v-model="form.includeRemarks" placeholder="包含节点关键字，用|分隔"></el-input>
                      </el-form-item>

                      <el-form-item label="排除节点">
                        <el-input v-model="form.excludeRemarks" placeholder="排除节点关键字，用|分隔"></el-input>
                      </el-form-item>

                      <el-form-item label="节点命名">
                        <el-input v-model="form.rename" placeholder="节点重命名规则"></el-input>
                      </el-form-item>

                      <el-form-item label="更新间隔">
                        <el-input v-model.number="form.interval" placeholder="订阅更新间隔（天）"></el-input>
                      </el-form-item>

                      <el-form-item label="规则选项">
                        <div class="rule-options-group">
                          <div class="rule-option">
                            <el-checkbox v-model="form.emoji">使用 Emoji</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.nodeList">输出节点列表</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.udp">启用 UDP</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.tfo">启用 TCP Fast Open</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.sort">节点排序</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.expand">展开规则</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.scv">跳过证书验证</el-checkbox>
                          </div>
                          <div class="rule-option">
                            <el-checkbox v-model="form.fdn">过滤非法节点</el-checkbox>
                          </div>
                        </div>
                      </el-form-item>
                    </div>
                  </el-collapse-item>
                </el-collapse>

                <!-- Mobile Toggle Button -->
                <div class="advanced-mobile-toggle" @click="openAdvancedDrawer">
                  <i class="el-icon-setting"></i>
                  高级功能
                </div>
              </el-form-item>
            </div>

            <!-- 生成按钮 -->
            <el-form-item>
              <el-button type="primary" @click="makeUrl" :loading="loading2" class="glass-button">
                <i class="el-icon-magic-stick"></i>
                生成订阅链接
              </el-button>
              <el-button type="success" @click="makeShortUrl" :loading="loading1" class="glass-button">
                <i class="el-icon-link"></i>
                生成短链接
              </el-button>
            </el-form-item>

            <!-- 结果显示 -->
            <div v-if="showSubscribeResult" class="result-section">
              <el-form-item label="订阅链接">
                <el-input v-model="customSubUrl" readonly>
                  <template slot="append">
                    <el-button @click="copyToClipboard(customSubUrl)" icon="el-icon-document-copy">
                      复制
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </div>

            <div v-if="showShortResult" class="result-section">
              <el-form-item label="短链接">
                <el-input v-model="customShortSubUrl" readonly>
                  <template slot="append">
                    <el-button @click="copyToClipboard(customShortSubUrl)" icon="el-icon-document-copy">
                      复制
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </el-form>
        </section>

        <!-- 底部信息 -->
        <footer class="glass-footer">
          <div class="footer-content">
            <!-- Footer content removed for cleaner design -->
          </div>
        </footer>
      </div>
    </div>

    <!-- Mobile Advanced Panel Drawer -->
    <div class="advanced-drawer" :class="{ 'is-open': isAdvancedDrawerOpen }" @click="closeAdvancedDrawerOnBackdrop">
      <div class="advanced-drawer-content" @click.stop>
        <div class="advanced-drawer-handle"></div>
        <div class="advanced-drawer-header">
          <div class="advanced-drawer-title">
            <i class="el-icon-setting"></i>
            高级功能
          </div>
          <div class="advanced-drawer-close" @click="closeAdvancedDrawer">
            <i class="el-icon-close"></i>
          </div>
        </div>
        <div class="advanced-drawer-body">
          <el-form label-width="108px" label-position="left" class="form-stack">
            <el-form-item label="包含节点">
              <el-input v-model="form.includeRemarks" placeholder="包含节点关键字，用|分隔"></el-input>
            </el-form-item>

            <el-form-item label="排除节点">
              <el-input v-model="form.excludeRemarks" placeholder="排除节点关键字，用|分隔"></el-input>
            </el-form-item>

            <el-form-item label="节点命名">
              <el-input v-model="form.rename" placeholder="节点重命名规则"></el-input>
            </el-form-item>

            <el-form-item label="更新间隔">
              <el-input v-model.number="form.interval" placeholder="订阅更新间隔（天）"></el-input>
            </el-form-item>

            <el-form-item label="规则选项">
              <div class="rule-options-group">
                <div class="rule-option">
                  <el-checkbox v-model="form.emoji">使用 Emoji</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.nodeList">输出节点列表</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.udp">启用 UDP</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.tfo">启用 TCP Fast Open</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.sort">节点排序</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.expand">展开规则</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.scv">跳过证书验证</el-checkbox>
                </div>
                <div class="rule-option">
                  <el-checkbox v-model="form.fdn">过滤非法节点</el-checkbox>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- Custom Backend Dialog -->
    <el-dialog
      title="自定义后端地址"
      :visible.sync="dialogCustomBackendVisible"
      width="500px"
      :close-on-click-modal="false">
      <el-form>
        <el-form-item label="后端地址">
          <el-input
            v-model="customBackendInput"
            placeholder="请输入自定义后端地址，例如：https://your-backend.com"
            clearable>
          </el-input>
          <div class="form-helper-text">
            请输入完整的SubConverter后端地址，例如：https://sub.yourdomain.com
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCustomBackendVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCustomBackend">确定</el-button>
      </div>
    </el-dialog>

    <!-- Manage Config Dialog -->
    <el-dialog
      title="管理远程配置"
      :visible.sync="dialogManageConfigVisible"
      width="600px"
      :close-on-click-modal="false">
      <div class="config-management">
        <el-tabs>
          <el-tab-pane label="上传配置">
            <el-form>
              <el-form-item label="配置内容">
                <el-input
                  v-model="uploadConfig"
                  type="textarea"
                  :rows="8"
                  placeholder="请粘贴配置文件内容">
                </el-input>
              </el-form-item>
            </el-form>
            <div style="text-align: center; margin-top: 20px;">
              <el-button type="primary" @click="confirmUploadConfig" :loading="loading2">
                上传配置
              </el-button>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="从链接解析">
            <el-form>
              <el-form-item label="订阅链接">
                <el-input
                  v-model="loadConfig"
                  placeholder="请输入已有的订阅链接，将自动解析配置">
                  <template slot="append">
                    <el-button @click="confirmLoadConfig" :loading="loading3">
                      解析
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeManageConfig">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { debounce, throttle, isLowEndDevice, autoEnablePerformanceMode, PerformanceMonitor } from '@/utils/performance';

const project = process.env.VUE_APP_PROJECT
const configScriptBackend = process.env.VUE_APP_CONFIG_UPLOAD_BACKEND + '/api.php'
const remoteConfigSample = process.env.VUE_APP_SUBCONVERTER_REMOTE_CONFIG
const scriptConfigSample = process.env.VUE_APP_SCRIPT_CONFIG
const filterConfigSample = process.env.VUE_APP_FILTER_CONFIG
const defaultBackend = process.env.VUE_APP_SUBCONVERTER_DEFAULT_BACKEND
const shortUrlBackend = process.env.VUE_APP_MYURLS_DEFAULT_BACKEND + '/short'
const configUploadBackend = process.env.VUE_APP_CONFIG_UPLOAD_BACKEND + '/sub.php'
const basicVideo = process.env.VUE_APP_BASIC_VIDEO
const advancedVideo = process.env.VUE_APP_ADVANCED_VIDEO
const tgBotLink = process.env.VUE_APP_BOT_LINK
const yglink = process.env.VUE_APP_YOUTUBE_LINK
const bzlink = process.env.VUE_APP_BILIBILI_LINK
export default {
  data() {
    return {
      backendVersion: "",
      currentTheme: "light-mode",
      performanceMode: false,
      activeName: 'first',
      // 是否为 PC 端
      isPC: true,
      btnBoolean: false,
      options: {
        clientTypes: {
          Clash: "clash",
          "Surge4/5": "surge&ver=4",
          "Sing-Box": "singbox",
          V2Ray: "v2ray",
          Trojan: "trojan",
          ShadowsocksR: "ssr",
          "混合订阅（mixed）": "mixed",
          Surfboard: "surfboard",
          Quantumult: "quan",
          "Quantumult X": "quanx",
          Loon: "loon",
          Mellow: "mellow",
          Surge3: "surge&ver=3",
          Surge2: "surge&ver=2",
          ClashR: "clashr",
          "Shadowsocks(SIP002)": "ss",
          "Shadowsocks Android(SIP008)": "sssub",
          ShadowsocksD: "ssd",
          "自动判断客户端": "auto",
        },
        shortTypes: {
          "v1.mk": "https://v1.mk/short",
          "d1.mk": "https://d1.mk/short",
          "dlj.tf": "https://dlj.tf/short",
          "suo.yt": "https://suo.yt/short",
        },
        customBackend: {
          "CM负载均衡后端【vless reality+hy1+hy2】": "https://subapi.cmliussss.net",
          "CM应急备用后端【vless reality+hy1+hy2】": "https://subapi.fxxk.dedyn.io",
          "肥羊增强型后端【vless reality+hy1+hy2】": "https://url.v1.mk",
          "肥羊备用后端【vless reality+hy1+hy2】": "https://sub.d1.mk",
          nameless13提供: "https://www.nameless13.com",
          subconverter作者提供: "https://sub.xeton.dev",
          "sub-web作者提供": "https://api.wcc.best",
        },
        backendOptions: [
          { value: "https://subapi.cmliussss.net" },
          { value: "https://subapi.fxxk.dedyn.io" },
          { value: "https://url.v1.mk" },
          { value: "https://sub.d1.mk" },
          { value: "https://www.nameless13.com" },
          { value: "https://sub.xeton.dev" },
          { value: "https://api.wcc.best" },
        ],
        remoteConfig: [
          {
            label: "CM规则",
            options: [
              {
                label: "CM_Online 默认版 识别港美地区(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online.ini"
              },
              {
                label: "CM_Online_MultiCountry 识别港美地区 负载均衡(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"
              },
              {
                label: "CM_Online_MultiCountry_CF 识别港美地区、CloudFlareCDN 负载均衡 Worker节点专用(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry_CF.ini"
              },
              {
                label: "CM_Online_Full 识别多地区分组(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full.ini"
              },
              {
                label: "CM_Online_Full_CF 识别多地区、CloudFlareCDN 分组 Worker节点专用(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_CF.ini"
              },
              {
                label: "CM_Online_Full_MultiMode 识别多地区 负载均衡(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"
              },
              {
                label: "CM_Online_Full_MultiMode_CF 识别多地区、CloudFlareCDN 负载均衡 Worker节点专用(与Github同步)",
                value: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_Full_MultiMode_CF.ini"
              }
            ]
          },
          {
            label: "通用",
            options: [
              {
                label: "默认",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini"
              },
              {
                label: "默认（自动测速）",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini"
              },
              {
                label: "默认（索尼电视专用）",
                value: "https://raw.githubusercontent.com/youshandefeiyang/webcdn/main/SONY.ini"
              },
              {
                label: "默认（附带用于 Clash 的 AdGuard DNS）",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/default_with_clash_adg.yml"
              },
              {
                label: "ACL_全分组 Dream修改版",
                value: "https://raw.githubusercontent.com/WC-Dream/ACL4SSR/WD/Clash/config/ACL4SSR_Online_Full_Dream.ini"
              },
              {
                label: "ACL_精简分组 Dream修改版",
                value: "https://raw.githubusercontent.com/WC-Dream/ACL4SSR/WD/Clash/config/ACL4SSR_Mini_Dream.ini"
              },
              {
                label: "emby-TikTok-流媒体分组-去广告加强版",
                value: "https://raw.githubusercontent.com/justdoiting/ClashRule/main/GeneralClashRule.ini"
              },
              {
                label: "流媒体通用分组",
                value: "https://raw.githubusercontent.com/cutethotw/ClashRule/main/GeneralClashRule.ini"
              }
            ]
          },
          {
            label: "ACL规则",
            options: [
              {
                label: "ACL_默认版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
              },
              {
                label: "ACL_无测速版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini"
              },
              {
                label: "ACL_去广告版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini"
              },
              {
                label: "ACL_多国家版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiCountry.ini"
              },
              {
                label: "ACL_无Reject版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini"
              },
              {
                label: "ACL_无测速精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_NoAuto.ini"
              },
              {
                label: "ACL_全分组版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
              },
              {
                label: "ACL_全分组谷歌版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini"
              },
              {
                label: "ACL_全分组多模式版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"
              },
              {
                label: "ACL_全分组奈飞版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini"
              },
              {
                label: "ACL_精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini"
              },
              {
                label: "ACL_去广告精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_AdblockPlus.ini"
              },
              {
                label: "ACL_Fallback精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_Fallback.ini"
              },
              {
                label: "ACL_多国家精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini"
              },
              {
                label: "ACL_多模式精简版",
                value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini"
              }
            ]
          },
          {
            label: "全网搜集规则",
            options: [
              {
                label: "常规规则",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG.ini"
              },
              {
                label: "酷酷自用",
                value: "https://raw.githubusercontent.com/xiaoshenxian233/cool/rule/complex.ini"
              },
              {
                label: "PharosPro无测速",
                value:
                  "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/special/phaors.ini"
              },
              {
                label: "分区域故障转移",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_Fallback.ini"
              },
              {
                label: "分区域自动测速",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_Urltest.ini"
              },
              {
                label: "分区域无自动测速",
                value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_NoAuto.ini"
              },
              {
                label: "OoHHHHHHH",
                value: "https://raw.githubusercontent.com/OoHHHHHHH/ini/master/config.ini"
              },
              {
                label: "CFW-TAP",
                value: "https://raw.githubusercontent.com/OoHHHHHHH/ini/master/cfw-tap.ini"
              },
              {
                label: "lhl77全分组（定期更新）",
                value: "https://raw.githubusercontent.com/lhl77/sub-ini/main/tsutsu-full.ini"
              },
              {
                label: "lhl77简易版（定期更新）",
                value: "https://raw.githubusercontent.com/lhl77/sub-ini/main/tsutsu-mini-gfw.ini"
              },
              {
                label: "ConnersHua 神机规则 Outbound",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/connershua_new.ini"
              },
              {
                label: "ConnersHua 神机规则 Inbound 回国专用",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/connershua_backtocn.ini"
              },
              {
                label: "lhie1 洞主规则（使用 Clash 分组规则）",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_clash.ini"
              },
              {
                label: "lhie1 洞主规则完整版",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_dler.ini"
              },
              {
                label: "eHpo1 规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/ehpo1_main.ini"
              },
              {
                label: "多策略组默认白名单模式",
                value: "https://raw.nameless13.com/api/public/dl/ROzQqi2S/white.ini"
              },
              {
                label: "多策略组可以有效减少审计触发",
                value: "https://raw.nameless13.com/api/public/dl/ptLeiO3S/mayinggfw.ini"
              },
              {
                label: "精简策略默认白名单",
                value: "https://raw.nameless13.com/api/public/dl/FWSh3dXz/easy3.ini"
              },
              {
                label: "多策略增加SMTP策略",
                value: "https://raw.nameless13.com/api/public/dl/L_-vxO7I/youtube.ini"
              },
              {
                label: "无策略入门推荐",
                value: "https://raw.nameless13.com/api/public/dl/zKF9vFbb/easy.ini"
              },
              {
                label: "无策略入门推荐国家分组",
                value: "https://raw.nameless13.com/api/public/dl/E69bzCaE/easy2.ini"
              },
              {
                label: "无策略仅IPIP CN + Final",
                value: "https://raw.nameless13.com/api/public/dl/XHr0miMg/ipip.ini"
              },
              {
                label: "无策略魅影vip分组",
                value: "https://raw.nameless13.com/api/public/dl/BBnfb5lD/MAYINGVIP.ini"
              },
              {
                label: "品云专属配置（仅香港区域分组）",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Examine.ini"
              },
              {
                label: "品云专属配置（全地域分组）",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Examine_Full.ini"
              },
              {
                label: "nzw9314 规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/nzw9314_custom.ini"
              },
              {
                label: "maicoo-l 规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/maicoo-l_custom.ini"
              },
              {
                label: "DlerCloud Platinum 李哥定制规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_platinum.ini"
              },
              {
                label: "DlerCloud Gold 李哥定制规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_gold.ini"
              },
              {
                label: "DlerCloud Silver 李哥定制规则",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_silver.ini"
              },
              {
                label: "ProxyStorage自用",
                value: "https://unpkg.com/proxy-script/config/Clash/clash.ini"
              },
              {
                label: "ShellClash修改版规则 (by UlinoyaPed)",
                value: "https://github.com/UlinoyaPed/ShellClash/raw/master/rules/ShellClash.ini"
              }
            ]
          },
          {
            label: "各大机场规则",
            options: [
              {
                label: "EXFLUX",
                value:
                  "https://gist.github.com/jklolixxs/16964c46bad1821c70fa97109fd6faa2/raw/EXFLUX.ini"
              },
              {
                label: "NaNoport",
                value:
                  "https://gist.github.com/jklolixxs/32d4e9a1a5d18a92beccf3be434f7966/raw/NaNoport.ini"
              },
              {
                label: "CordCloud",
                value:
                  "https://gist.github.com/jklolixxs/dfbe0cf71ffc547557395c772836d9a8/raw/CordCloud.ini"
              },
              {
                label: "BigAirport",
                value:
                  "https://gist.github.com/jklolixxs/e2b0105c8be6023f3941816509a4c453/raw/BigAirport.ini"
              },
              {
                label: "跑路云",
                value:
                  "https://gist.github.com/jklolixxs/9f6989137a2cfcc138c6da4bd4e4cbfc/raw/PaoLuCloud.ini"
              },
              {
                label: "WaveCloud",
                value:
                  "https://gist.github.com/jklolixxs/fccb74b6c0018b3ad7b9ed6d327035b3/raw/WaveCloud.ini"
              },
              {
                label: "几鸡",
                value:
                  "https://gist.github.com/jklolixxs/bfd5061dceeef85e84401482f5c92e42/raw/JiJi.ini"
              },
              {
                label: "四季加速",
                value:
                  "https://gist.github.com/jklolixxs/6ff6e7658033e9b535e24ade072cf374/raw/SJ.ini"
              },
              {
                label: "ImmTelecom",
                value:
                  "https://gist.github.com/jklolixxs/24f4f58bb646ee2c625803eb916fe36d/raw/ImmTelecom.ini"
              },
              {
                label: "AmyTelecom",
                value:
                  "https://gist.github.com/jklolixxs/b53d315cd1cede23af83322c26ce34ec/raw/AmyTelecom.ini"
              },
              {
                label: "LinkCube",
                value:
                  "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/convenience.ini"
              },
              {
                label: "Miaona",
                value:
                  "https://gist.github.com/jklolixxs/ff8ddbf2526cafa568d064006a7008e7/raw/Miaona.ini"
              },
              {
                label: "Foo&Friends",
                value:
                  "https://gist.github.com/jklolixxs/df8fda1aa225db44e70c8ac0978a3da4/raw/Foo&Friends.ini"
              },
              {
                label: "ABCloud",
                value:
                  "https://gist.github.com/jklolixxs/b1f91606165b1df82e5481b08fd02e00/raw/ABCloud.ini"
              },
              {
                label: "咸鱼",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/xianyu.ini"
              },
              {
                label: "便利店",
                value: "https://subweb.oss-cn-hongkong.aliyuncs.com/RemoteConfig/customized/convenience.ini"
              },
              {
                label: "CNIX",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/SSRcloud.ini"
              },
              {
                label: "Nirvana",
                value: "https://raw.githubusercontent.com/Mazetsz/ACL4SSR/master/Clash/config/V2rayPro.ini"
              },
              {
                label: "V2Pro",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/V2Pro.ini"
              },
              {
                label: "史迪仔-自动测速",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Stitch.ini"
              },
              {
                label: "史迪仔-负载均衡",
                value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Stitch-Balance.ini"
              },
              {
                label: "Maying",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/maying.ini"
              },
              {
                label: "Ytoo",
                value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/ytoo.ini"
              },
              {
                label: "w8ves",
                value: "https://raw.nameless13.com/api/public/dl/M-We_Fn7/w8ves.ini"
              },
              {
                label: "NyanCAT",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/nyancat.ini"
              },
              {
                label: "Nexitally",
                value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/nexitally.ini"
              },
              {
                label: "SoCloud",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/socloud.ini"
              },
              {
                label: "ARK",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/ark.ini"
              },
              {
                label: "N3RO",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/n3ro_optimized.ini"
              },
              {
                label: "Scholar",
                value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/scholar_optimized.ini"
              },
              {
                label: "Flowercloud",
                value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/flower.ini"
              }
            ]
          },
          {
            label: "特殊",
            options: [
              {
                label: "NeteaseUnblock",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/netease.ini"
              },
              {
                label: "Basic",
                value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/basic.ini"
              }
            ]
          }
        ]
      },
      form: {
        sourceSubUrl: "",
        clientType: "",
        customBackend: "https://url.v1.mk",
        shortType: "https://v1.mk/short",
        remoteConfig: "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online.ini",
        excludeRemarks: "",
        includeRemarks: "",
        filename: "",
        rename: "",
        devid: "",
        interval: "",
        emoji: true,
        nodeList: false,
        extraset: false,
        tls13: false,
        udp: false,
        xudp: false,
        tfo: false,
        sort: false,
        expand: true,
        scv: false,
        fdn: false,
        appendType: false,
        insert: false, // 是否插入默认订阅的节点，对应配置项 insert_url
        new_name: true, // 是否使用 Clash 新字段
        tpl: {
          surge: {
            doh: false // dns 查询是否使用 DoH
          },
          clash: {
            doh: false
          },
          singbox: {
            ipv6: false
          }
        }
      },
      loading1: false,
      loading2: false,
      loading3: false,
      customSubUrl: "",
      customShortSubUrl: "",
      dialogUploadConfigVisible: false,
      loadConfig: "",
      dialogLoadConfigVisible: false,
      uploadFilter: "",
      uploadScript: "",
      uploadConfig: "",
      myBot: tgBotLink,
      filterConfig: filterConfigSample,
      scriptConfig: scriptConfigSample,
      sampleConfig: remoteConfigSample,
      isAdvancedDrawerOpen: false,
      showSubscribeResult: false,
      showShortResult: false,
      // Custom dialogs
      dialogCustomBackendVisible: false,
      customBackendInput: "",
      dialogManageConfigVisible: false
    };
  },
  created() {
    document.title = "在线订阅转换工具";
    this.isPC = this.$getOS().isPc;
  },
  mounted() {
    try {
      //this.tanchuang();
      this.form.clientType = "clash";
      
      // Handle URL parameters for backend
      const urlBackend = this.getUrlParam();
      if (urlBackend !== "") {
        this.form.customBackend = urlBackend;
      }
      
      // Initialize theme first
      this.anhei();
      this.currentTheme = document.body.className || "light-mode";
      
      // Initialize performance mode
      const savedPerfMode = window.localStorage.getItem('performanceMode');
      if (savedPerfMode === 'true') {
        this.performanceMode = true;
        document.body.classList.add('performance-mode');
      } else if (autoEnablePerformanceMode()) {
        // Auto-enable on low-end devices
        this.performanceMode = true;
        document.body.classList.add('performance-mode');
        window.localStorage.setItem('performanceMode', 'true');
      }
      
      // Initialize performance monitoring (only in development or if not in performance mode)
      if (process.env.NODE_ENV === 'development' || !this.performanceMode) {
        this.performanceMonitor = new PerformanceMonitor();
        this.performanceMonitor.startMonitoring();
      }
      
      // Then get backend version
      this.getBackendVersion();
      
      // Set up theme change listeners
      let lightMedia = window.matchMedia('(prefers-color-scheme: light)');
      let darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      let callback = (e) => {
        if (e.matches) {
          this.anhei();
        }
      };
      if (typeof darkMedia.addEventListener === 'function' || typeof lightMedia.addEventListener === 'function') {
        lightMedia.addEventListener('change', callback);
        darkMedia.addEventListener('change', callback);
      } //监听系统主题，自动切换！
    } catch (error) {
      console.error('Error in mounted hook:', error);
    }
  },
  beforeDestroy() {
    // Clean up performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.stopMonitoring();
    }
  },
  methods: {
    selectChanged: debounce(function() {
      this.getBackendVersion();
    }, 300),
    getUrlParam() {
      let query = window.location.search.substring(1);
      let vars = query.split('&');
      for (let i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == "backend") {
          return decodeURIComponent(pair[1]);
        }
      }
      return "";
    },
    anhei() {
      const getLocalTheme = window.localStorage.getItem("localTheme");
      const lightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
      const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      let applied = '';

      if (getLocalTheme && getLocalTheme !== null && getLocalTheme !== "undefined" && getLocalTheme !== "") {
        applied = getLocalTheme;
      } else {
        if (new Date().getHours() >= 19 || new Date().getHours() < 7) {
          applied = 'dark-mode';
        } else {
          applied = 'light-mode';
        }
        if (lightMode && lightMode.matches) {
          applied = 'light-mode';
        }
        if (darkMode && darkMode.matches) {
          applied = 'dark-mode';
        }
      }

      document.body.className = applied;
      this.currentTheme = applied || 'light-mode';
    },
    change() {
      const zhuti = document.body.className;
      if (zhuti === 'light-mode') {
        document.body.className = 'dark-mode';
        window.localStorage.setItem('localTheme', 'dark-mode');
      } else {
        document.body.className = 'light-mode';
        window.localStorage.setItem('localTheme', 'light-mode');
      }
      this.currentTheme = document.body.className || 'light-mode';
    },
    togglePerformanceMode() {
      this.performanceMode = !this.performanceMode;
      const body = document.body;
      
      if (this.performanceMode) {
        body.classList.add('performance-mode');
        window.localStorage.setItem('performanceMode', 'true');
        this.$message.success('性能模式已开启 - UI效果已优化');
      } else {
        body.classList.remove('performance-mode');
        window.localStorage.setItem('performanceMode', 'false');
        this.$message.info('性能模式已关闭 - 恢复完整视觉效果');
      }
    },
    tanchuang() {
      this.$alert(`<div style="text-align:center;font-size:15px"><strong><span style="font-size:20px;color:red">apiurl.v1.mk已被蔷，请更换最新的url.v1.mk</span></strong></br><strong><span style="font-size:20px">本站官方TG交流群：</span><span><a href="https://t.me/feiyangdigital" target="_blank" style="color:red;font-size:20px;text-decoration:none">点击加入</a></span></strong></br><strong><span style="font-size:20px">IEPL高端机场（<span style="color:blue">原生支持奈飞非自制剧、Disney Plus、HBO等各种流媒体，支持Chat-GPT和ISP住宅IP助力Tiktok等跨境贸易使用</span>）：</span><span><a href="https://www.mcwy.org" style="color:red;font-size:20px;text-decoration:none">点击注册</a></span></strong></br><strong><span style="font-size:20px">奈飞、ChatGPT合租（<span style="color:blue">优惠码：feiyang</span>）：</span><span><a href="https://hezu.v1.mk/" style="color:red;font-size:20px;text-decoration:none">点击上车</a></span></strong></br><strong><span style="font-size:20px">115蓝光4K原盘内部资源群：</span><span><a href="https://115.metshop.top" target="_blank" style="color:red;font-size:20px;text-decoration:none">点击查看</a></span></strong></br>本站服务器赞助机场-牧场物语，是一家拥有BGP中继+IEPL企业级内网专线的高端机场，适合各个价位要求的用户，牧场物语采用最新的奈飞非自制剧解决方案，出口随机更换IP，确保尽可能的每个用户可以用上独立IP，以此来稳定解决奈飞非自制剧的封锁，并推出7*24小时奈飞非自制剧节点自动检测系统，用户再也不用自己手动一个个的乱试节点了，目前牧场的新加坡，台湾等节区域点均可做到24H稳定非自制剧观看，支持Chat-GPT和ISP住宅IP助力Tiktok等跨境贸易使用！</br></div>`, '信息面板', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
        customClass: 'msgbox'
      });
    },
    onCopy() {
      this.$message.success("已复制");
    },
    copyToClipboard(text) {
      this.$copyText(text).then(() => {
        this.$message.success("复制成功");
      }).catch(() => {
        this.$message.error("复制失败");
      });
    },
    goToProject() {
      window.open(project);
    },
    gotoTgChannel() {
      window.open(tgBotLink);
    },
    gotoBiliBili() {
      window.open(bzlink);
    },
    gotoYouTuBe() {
      window.open(yglink);
    },
    makeUrl: debounce(function() {
      if (this.form.sourceSubUrl === "" || this.form.clientType === "") {
        this.$message.error("订阅链接与客户端为必填项");
        return false;
      }
      let backend =
        this.form.customBackend === ""
          ? defaultBackend
          : this.form.customBackend;
      let sourceSub = this.form.sourceSubUrl;
      sourceSub = sourceSub.replace(/(\n|\r|\n\r)/g, "|");
      this.customSubUrl =
        backend +
        "/sub?target=" +
        this.form.clientType +
        "&url=" +
        encodeURIComponent(sourceSub) +
        "&insert=" +
        this.form.insert;
      if (this.form.remoteConfig !== "") {
        this.customSubUrl +=
          "&config=" + encodeURIComponent(this.form.remoteConfig);
      }
      if (this.form.excludeRemarks !== "") {
        this.customSubUrl +=
          "&exclude=" + encodeURIComponent(this.form.excludeRemarks);
      }
      if (this.form.includeRemarks !== "") {
        this.customSubUrl +=
          "&include=" + encodeURIComponent(this.form.includeRemarks);
      }
      if (this.form.filename !== "") {
        this.customSubUrl +=
          "&filename=" + encodeURIComponent(this.form.filename);
      }
      if (this.form.rename !== "") {
        this.customSubUrl +=
          "&rename=" + encodeURIComponent(this.form.rename);
      }
      if (this.form.interval !== "") {
        this.customSubUrl +=
          "&interval=" + encodeURIComponent(this.form.interval * 86400);
      }
      if (this.form.devid !== "") {
        this.customSubUrl +=
          "&dev_id=" + encodeURIComponent(this.form.devid);
      }
      if (this.form.appendType) {
        this.customSubUrl +=
          "&append_type=" + this.form.appendType.toString();
      }
      if (this.form.tls13) {
        this.customSubUrl +=
          "&tls13=" + this.form.tls13.toString();
      }
      if (this.form.sort) {
        this.customSubUrl +=
          "&sort=" + this.form.sort.toString();
      }
      this.customSubUrl +=
        "&emoji=" +
        this.form.emoji.toString() +
        "&list=" +
        this.form.nodeList.toString() +
        "&xudp=" +
        this.form.xudp.toString() +
        "&udp=" +
        this.form.udp.toString() +
        "&tfo=" +
        this.form.tfo.toString() +
        "&expand=" +
        this.form.expand.toString() +
        "&scv=" +
        this.form.scv.toString() +
        "&fdn=" +
        this.form.fdn.toString();
      if (this.form.clientType.includes("surge")) {
        if (this.form.tpl.surge.doh === true) {
          this.customSubUrl += "&surge.doh=true";
        }
      }
      if (this.form.clientType === "clash") {
        if (this.form.tpl.clash.doh === true) {
          this.customSubUrl += "&clash.doh=true";
        }
        this.customSubUrl += "&new_name=" + this.form.new_name.toString();
      }
      if (this.form.clientType === "singbox") {
        if (this.form.tpl.singbox.ipv6 === true) {
          this.customSubUrl += "&singbox.ipv6=1";
        }
      }
      this.$copyText(this.customSubUrl);
      this.$message.success("定制订阅已复制到剪贴板");
      this.showSubscribeResult = true;
    }, 300),
    makeShortUrl() {
      if (!this.customSubUrl) {
        this.$message.error("请先生成订阅链接");
        return;
      }

      let duan =
        this.form.shortType === ""
          ? shortUrlBackend
          : this.form.shortType;
      this.loading1 = true;
      
      try {
        // Use proper URL encoding instead of btoa for better compatibility
        let data = new FormData();
        data.append("longUrl", encodeURIComponent(this.customSubUrl));
        
        if (this.customShortSubUrl.trim() != "") {
          data.append("shortKey", this.customShortSubUrl.trim().indexOf("http") < 0 ? this.customShortSubUrl.trim() : "");
        }
        
        this.$axios
          .post(duan, data, {
            headers: {
              "Content-Type": "multipart/form-data"
            },
            timeout: 10000 // 10 second timeout
          })
          .then(res => {
            // Handle different response formats
            let shortUrl = "";
            if (res.data && typeof res.data === 'object') {
              // Try different possible response formats
              shortUrl = res.data.ShortUrl || res.data.shortUrl || res.data.url || res.data.data || "";
            } else if (typeof res.data === 'string') {
              shortUrl = res.data;
            }
            
            if (shortUrl && shortUrl.startsWith('http')) {
              this.customShortSubUrl = shortUrl;
              this.$copyText(shortUrl);
              this.$message.success("短链接已复制到剪贴板");
              this.showShortResult = true;
            } else {
              // Fallback: copy the original long URL
              this.$copyText(this.customSubUrl);
              this.$message.warning("短链接生成失败，已复制原始订阅链接");
            }
          })
          .catch(error => {
            console.error('Short URL generation error:', error);
            // Fallback: copy the original long URL
            this.$copyText(this.customSubUrl);
            
            // Provide more specific error messages
            if (error.response) {
              const status = error.response.status;
              if (status === 429) {
                this.$message.warning("请求过于频繁，已复制原始订阅链接");
              } else if (status >= 500) {
                this.$message.warning("短链服务暂时不可用，已复制原始订阅链接");
              } else {
                this.$message.warning("短链接生成失败，已复制原始订阅链接");
              }
            } else if (error.code === 'ECONNABORTED') {
              this.$message.warning("请求超时，已复制原始订阅链接");
            } else {
              this.$message.warning("网络连接失败，已复制原始订阅链接");
            }
          })
          .finally(() => {
            this.loading1 = false;
          });
      } catch (error) {
        console.error('Error in makeShortUrl:', error);
        // Fallback: copy the original long URL
        this.$copyText(this.customSubUrl);
        this.$message.warning("生成短链时出错，已复制原始订阅链接");
        this.loading1 = false;
      }
    },
    confirmUploadConfig() {
      this.loading2 = true;
      let data = new FormData();
      data.append("config", encodeURIComponent(this.uploadConfig));
      this.$axios
        .post(configUploadBackend, data, {
          header: {
            "Content-Type": "application/form-data; charset=utf-8"
          }
        })
        .then(res => {
          if (res.data.code === 0 && res.data.data !== "") {
            this.$message.success(
              "远程配置上传成功，配置链接已复制到剪贴板"
            );
            this.form.remoteConfig = res.data.data;
            this.$copyText(this.form.remoteConfig);
            this.dialogUploadConfigVisible = false;
          } else {
            this.$message.error("远程配置上传失败: " + res.data.msg);
          }
        })
        .catch(() => {
          this.$message.error("远程配置上传失败");
        })
        .finally(() => {
          this.loading2 = false;
        });
    },
    analyzeUrl() {
      if (this.loadConfig.indexOf("target") !== -1) {
        return this.loadConfig;
      } else {
        this.loading3 = true;
        return (async () => {
          try {
            let response = await fetch(this.loadConfig, {
              method: "GET",
              redirect: "follow",
            });
            return response.url;
          } catch (e) {
            this.$message.error("解析短链接失败，请检查短链接服务端是否配置跨域：" + e)
          } finally {
            this.loading3 = false;
          }
        })();
      }
    },
    confirmLoadConfig() {
      if (this.loadConfig.trim() === "" || !this.loadConfig.trim().includes("http")) {
        this.$message.error("待解析的订阅链接不合法");
        return false;
      }
      (async () => {
        let url
        try {
          url = new URL(await this.analyzeUrl())
        } catch (error) {
          this.$message.error("请输入正确的订阅地址!");
          return;
        }
        this.form.customBackend = url.origin
        let param = new URLSearchParams(url.search);
        if (param.get("target")) {
          let target = param.get("target");
          if (target === 'surge' && param.get("ver")) {
            // 类型为surge,有ver
            this.form.clientType = target + "&ver=" + param.get("ver");
          } else if (target === 'surge') {
            //类型为surge,没有ver
            this.form.clientType = target + "&ver=4"
          } else {
            //类型为其他
            this.form.clientType = target;
          }
        }
        if (param.get("url")) {
          this.form.sourceSubUrl = param.get("url");
        }
        if (param.get("insert")) {
          this.form.insert = param.get("insert") === 'true';
        }
        if (param.get("config")) {
          this.form.remoteConfig = param.get("config");
        }
        if (param.get("exclude")) {
          this.form.excludeRemarks = param.get("exclude");
        }
        if (param.get("include")) {
          this.form.includeRemarks = param.get("include");
        }
        if (param.get("filename")) {
          this.form.filename = param.get("filename");
        }
        if (param.get("rename")) {
          this.form.rename = param.get("rename");
        }
        if (param.get("interval")) {
          this.form.interval = Math.ceil(param.get("interval") / 86400);
        }
        if (param.get("dev_id")) {
          this.form.devid = param.get("dev_id");
        }
        if (param.get("append_type")) {
          this.form.appendType = param.get("append_type") === 'true';
        }
        if (param.get("tls13")) {
          this.form.tls13 = param.get("tls13");
        }
        if (param.get("xudp")) {
          this.form.xudp = param.get("xudp") === 'true';
        }
        if (param.get("sort")) {
          this.form.sort = param.get("sort") === 'true';
        }
        if (param.get("emoji")) {
          this.form.emoji = param.get("emoji") === 'true';
        }
        if (param.get("list")) {
          this.form.nodeList = param.get("list") === 'true';
        }
        if (param.get("udp")) {
          this.form.udp = param.get("udp") === 'true';
        }
        if (param.get("tfo")) {
          this.form.tfo = param.get("tfo") === 'true';
        }
        if (param.get("expand")) {
          this.form.expand = param.get("expand") === 'true';
        }
        if (param.get("scv")) {
          this.form.scv = param.get("scv") === 'true';
        }
        if (param.get("fdn")) {
          this.form.fdn = param.get("fdn") === 'true';
        }
        if (param.get("surge.doh")) {
          this.form.tpl.surge.doh = param.get("surge.doh") === 'true';
        }
        if (param.get("clash.doh")) {
          this.form.tpl.clash.doh = param.get("clash.doh") === 'true';
        }
        if (param.get("new_name")) {
          this.form.new_name = param.get("new_name") === 'true';
        }
        if (param.get("singbox.ipv6")) {
          this.form.tpl.singbox.ipv6 = param.get("singbox.ipv6") === '1';
        }
        this.dialogLoadConfigVisible = false;
        this.$message.success("长/短链接已成功解析为订阅信息");
      })();
    },
    renderPost() {
      let data = new FormData();
      data.append("target", encodeURIComponent(this.form.clientType));
      data.append("url", encodeURIComponent(this.form.sourceSubUrl));
      data.append("config", encodeURIComponent(this.form.remoteConfig));
      data.append("exclude", encodeURIComponent(this.form.excludeRemarks));
      data.append("include", encodeURIComponent(this.form.includeRemarks));
      data.append("rename", encodeURIComponent(this.form.rename));
      data.append("tls13", encodeURIComponent(this.form.tls13.toString()));
      data.append("xudp", encodeURIComponent(this.form.xudp.toString()));
      data.append("emoji", encodeURIComponent(this.form.emoji.toString()));
      data.append("list", encodeURIComponent(this.form.nodeList.toString()));
      data.append("udp", encodeURIComponent(this.form.udp.toString()));
      data.append("tfo", encodeURIComponent(this.form.tfo.toString()));
      data.append("expand", encodeURIComponent(this.form.expand.toString()));
      data.append("scv", encodeURIComponent(this.form.scv.toString()));
      data.append("fdn", encodeURIComponent(this.form.fdn.toString()));
      data.append("sdoh", encodeURIComponent(this.form.tpl.surge.doh.toString()));
      data.append("cdoh", encodeURIComponent(this.form.tpl.clash.doh.toString()));
      data.append("newname", encodeURIComponent(this.form.new_name.toString()));
      return data;
    },
    confirmUploadScript() {
      if (this.form.sourceSubUrl.trim() === "") {
        this.$message.error("订阅链接不能为空");
        return false;
      }
      this.loading2 = true;
      let data = this.renderPost();
      data.append("sortscript", encodeURIComponent(this.uploadScript));
      data.append("filterscript", encodeURIComponent(this.uploadFilter));
      this.$axios
        .post(configScriptBackend, data, {
          header: {
            "Content-Type": "application/form-data; charset=utf-8"
          }
        })
        .then(res => {
          if (res.data.code === 0 && res.data.data !== "") {
            this.$message.success(
              "自定义JS上传成功，订阅链接已复制到剪贴板（IOS设备和Safari浏览器不支持自动复制API，需手动点击复制按钮）"
            );
            this.customSubUrl = res.data.data;
            this.$copyText(res.data.data);
            this.dialogUploadConfigVisible = false;
            this.btnBoolean = true;
          } else {
            this.$message.error("自定义JS上传失败: " + res.data.msg);
          }
        })
        .catch(() => {
          this.$message.error("自定义JS上传失败");
        })
        .finally(() => {
          this.loading2 = false;
        })
    },
    getBackendVersion() {
      this.$axios
        .get(
          this.form.customBackend + "/version"
        )
        .then(res => {
          this.backendVersion = res.data.replace(/backend\n$/gm, "");
          this.backendVersion = this.backendVersion.replace("subconverter", "SubConverter");
          let a = this.form.customBackend.indexOf("url.v1.mk") !== -1 || this.form.customBackend.indexOf("sub.d1.mk") !== -1;
          let b = this.form.customBackend.indexOf("127.0.0.1") !== -1;
          a ? this.$message.success(`${this.backendVersion}` + "肥羊负载均衡增强版后端，已屏蔽免费节点池（会返回403），额外支持vless reality+hysteria+hysteria2订阅转换") : b ? this.$message.success(`${this.backendVersion}` + "本地局域网自建版后端") : this.$message.success(`${this.backendVersion}`);
        })
        .catch(() => {
          this.$message.error("请求SubConverter版本号返回数据失败，该后端不可用！");
        });
    },
    
    // Mobile Advanced Panel Drawer Methods
    openAdvancedDrawer() {
      this.isAdvancedDrawerOpen = true;
      document.body.style.overflow = 'hidden';
    },
    
    closeAdvancedDrawer() {
      this.isAdvancedDrawerOpen = false;
      document.body.style.overflow = '';
    },
    
    closeAdvancedDrawerOnBackdrop(event) {
      if (event.target === event.currentTarget) {
        this.closeAdvancedDrawer();
      }
    },
    
    // Handle backend change - show custom dialog if needed
    handleBackendChange(value) {
      if (value === "__custom__") {
        this.dialogCustomBackendVisible = true;
        this.customBackendInput = "";
        // Reset to previous value
        this.form.customBackend = "https://url.v1.mk";
      } else {
        // Get backend version when backend changes
        this.getBackendVersion();
      }
    },
    
    // Confirm custom backend
    confirmCustomBackend() {
      if (this.customBackendInput.trim() === "") {
        this.$message.error("请输入自定义后端地址");
        return;
      }
      
      // Validate URL format
      try {
        new URL(this.customBackendInput.trim());
      } catch (error) {
        this.$message.error("请输入有效的URL地址");
        return;
      }
      
      this.form.customBackend = this.customBackendInput.trim();
      this.dialogCustomBackendVisible = false;
      this.$message.success("自定义后端地址已设置");
      this.getBackendVersion();
    },
    
    // Handle remote config change - show manage dialog if needed
    handleRemoteConfigChange(value) {
      if (value === "__manage__") {
        this.dialogManageConfigVisible = true;
        // Reset to previous value
        this.form.remoteConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online.ini";
      }
    },
    
    // Close manage config dialog
    closeManageConfig() {
      this.dialogManageConfigVisible = false;
    }
  }
};
</script>
