import styled, { keyframes, css } from "styled-components";

export const colorBackground =
  "radial-gradient(circle, rgba(37,55,66,1) 0%, rgba(22,34,43,1) 100%)";
export const colorBoxBackground =
  "linear-gradient(40deg, #16222B 0%, #21303A 100%)";
export const colorGlassBackground =
  "radial-gradient(circle, rgba(255, 255, 255, 0.075) 0%, rgba(255, 255, 255, 0.03) 100%)";
export const colorGlassBackgroundModal =
  "radial-gradient(circle, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.5) 100%)";
export const colorGlassBackgroundBlur = "rgba(0, 0, 0, 0.5)";
export const colorGlassBackgroundMenu = "rgba(255, 255, 255, 0.75)";
export const colorGlassBorder = "rgba(255, 255, 255, 0.1)";
export const colorPrimary = "#459381";
export const colorSecondary = "#16222B";
export const colorAccent = "#31806C";
export const colorText = "#FFFFFF";
export const colorBorder = "#21303A";
export const colorLightBorder = "#2E3F4A";
export const colorShadow = "rgba(0, 0, 0, 0.1";

export const colorTransparent = "transparent";
export const colorBlack = "#000000";
export const colorWhite = "#FFFFFF";
export const colorExtraLightGray = "#ECECEC";
export const colorLightGray = "#C1C1C1";
export const colorGray = "#7F7F7F";
export const colorDarkGray = "#535353";
export const colorExtraDarkGray = "#535353";
export const colorSemiBlack = "#333333";

export const fontSizeH1 = "52pt";
export const fontSizeH2 = "42pt";
export const fontSizeH3 = "32pt";
export const fontSizeH4 = "24pt";
export const fontSizeH5 = "18pt";
export const fontSizeH6 = "10pt";
export const fontSize = "10pt";
export const fontWeight = "normal";

export const borderNone = "none";
export const borderDefault = `1px solid ${colorBorder}`;
export const borderLight = `1px solid ${colorLightBorder}`;
export const borderRadiusDefault = "15px";
export const borderRadiusRound = "99px";
export const paddingZero = "0px";
export const paddingLow = "5px";
export const paddingDefault = "10px";
export const paddingHigh = "20px";
export const marginZero = "0px";
export const marginLow = "5px";
export const marginDefault = "10px";
export const marginHigh = "15px";
export const marginUpDownSpacing = "50px auto 50px auto";
export const defaultGap = "10px";

export const buttonWidthDefault = "auto";
export const buttonWidthFull = "100%";
export const buttonPaddingDefault = "10px 15px 10px 15px";
export const buttonBorder = `1px solid ${colorTransparent}`;
export const buttonOutlinedBorder = `1px solid ${colorPrimary}`;
export const buttonRoundSize = "48px";

// Animations

export const fadeIn = keyframes`
  from {
    transform: translateY(0);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(0);
    opacity: 0;
  }
`;

export const fadeInUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const fadeOutUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-30px);
    opacity: 0;
  }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid ${colorPrimary};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const ButtonPrimary = styled.button`
  padding: ${buttonPaddingDefault};
  margin: ${marginLow};
  width: ${buttonWidthDefault};
  font-weight: ${fontWeight};
  font-size: ${fontSizeH6};
  text-align: center;
  border-radius: ${borderRadiusRound};
  border: ${buttonBorder};
  background: ${colorPrimary};
  color: ${colorText};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: default;
  position: relative;
  z-index: 1;
  &:hover {
    background: ${colorAccent};
  }
  &:active {
    border: none;
  }
  &:disabled {
    cursor: not-allowed;
  }
  > * {
    user-select: none;
  }
`;

export const ButtonSecondary = styled.button`
  padding: ${buttonPaddingDefault};
  margin: ${marginLow};
  width: ${buttonWidthDefault};
  font-weight: ${fontWeight};
  font-size: ${fontSizeH6};
  text-align: center;
  border-radius: ${borderRadiusRound};
  border: ${buttonBorder};
  background: ${colorPrimary};
  color: ${colorText};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: default;
  position: relative;
  z-index: 1;
  &:hover {
    background: ${colorAccent};
  }
  &:active {
    border: none;
  }
  &:disabled {
    cursor: not-allowed;
  }
  > * {
    user-select: none;
  }
`;

export const ButtonRound = styled.button`
  padding: ${paddingLow};
  width: ${buttonRoundSize};
  height: ${buttonRoundSize};
  font-weight: ${fontWeight};
  font-size: ${fontSizeH6};
  text-align: center;
  border-radius: ${borderRadiusRound};
  border: 1px solid ${colorGlassBorder};
  background: ${colorGlassBackground};
  color: ${colorText};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: default;
  position: relative;
  z-index: 1;
  &:hover {
    background: ${colorGlassBorder};
  }
  &:active {
    border: none;
  }
  &:disabled {
    cursor: not-allowed;
  }
  > * {
    user-select: none;
  }
`;

export const Link = styled.a`
  text-decoration: none;
  color: ${colorPrimary};
  &:hover {
    text-decoration: underline;
    color: ${colorAccent};
  }
`;

export const FullPageBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  width: 100%;
  height: calc(100vh - ${paddingHigh} - ${paddingHigh});
  min-width: 320px;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
`;

export const FullContainerBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${paddingDefault};
  margin: 0;
  border-radius: ${borderRadiusDefault};
  border: 1px solid ${colorGlassBorder};
  background: ${colorGlassBackground};
  width: 100%;
  height: 100%;
  min-width: 320px;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
  animation: ${fadeIn} 0.5s ease-out forwards;
`;

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${paddingHigh};
  margin: 0;
  border-radius: ${borderRadiusDefault};
  border: ${borderDefault};
  background: ${colorBoxBackground};
  width: 100%;
  min-width: 320px;
  justify-content: flex-start;
  align-items: center;
  gap: ${defaultGap};
`;

export const BoxSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${paddingDefault};
  gap: 10px;
`;

export const BoxContentParent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
`;

export const BoxContent = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: ${defaultGap};
  z-index: 2;
`;

export const HorMenuOption = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  min-width: 280px;
  justify-content: flex-start;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  gap: 0px;
  cursor: pointer;
  background: ${colorGlassBackgroundModal};
  color: ${colorSemiBlack};
  padding: 12px 20px;
  border: 1px solid ${colorGlassBorder};
  border-radius: ${borderRadiusDefault};
  &:hover {
    background: ${colorGlassBackgroundMenu};
  }
`

export const BoxHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  background: ${colorTransparent};
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
  margin: -10px 0 10px 0;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
  box-sizing: border-box;
`;

export const HeaderButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  background: ${colorTransparent};
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const Divider = styled.div`
  display: flex;
  flex-direction: column;
  background: ${colorTransparent};
  padding: ${paddingZero};
  margin: ${marginZero};
  border-bottom: ${borderLight};
  width: 100%;
  box-sizing: border-box;
`;

export const Spacer = styled.div`
  margin: 3px;
  box-sizing: border-box;
`;

export const TextHeader = styled.h2`
  font-size: ${fontSizeH2};
  margin: 0;
  box-sizing: border-box;
`;

export const TextTitle = styled.h4`
  font-size: ${fontSizeH4};
  margin: 0;
  box-sizing: border-box;
`;

export const TextSubTitle = styled.h5`
  font-size: ${fontSizeH5};
  margin: 0;
  font-weight: light;
  box-sizing: border-box;
`;

export const Text = styled.p`
  font-size: ${fontSize};
  margin: 0;
  box-sizing: border-box;
`;

export const SmallText = styled.p`
  font-size: 8pt;
  margin: 0;
`;

export const Input = styled.input`
  font-size: 11pt;
  border-radius: ${borderRadiusDefault};
  padding: ${buttonPaddingDefault};
  border: 1px solid ${colorGlassBorder};
  text-align: center;
  background: ${colorGlassBackground};
  z-index: 2;
`;

export const Hr = styled.hr`
  border: none;
  border-top: 1px solid ${colorGlassBorder};
  width: 100%;
  margin: 1em 0;
`;

export const Sp = styled.div`
  margin: 10px;
  width: 100%;
`;

export const StepWrapper = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${({ $active }) => ($active ? "flex" : "none")};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  /* fade in/out */
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;

  /* prevent clicks on invisible steps */
  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};

  z-index: ${({ $active }) => ($active ? 1 : -1)};
`;

// Modal Exports

export const ModalBackground = styled.div<{ visible: boolean }>`
  position: fixed;
  inset: 0;
  display: ${({ visible }) => (visible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  background: ${colorGlassBackgroundBlur};
  backdrop-filter: blur(5px);
  border-radius: 0;
  z-index: 3;
`;

export const ModalContainer = styled.div<{ exiting: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 30px;
  max-width: 800px;
  border-radius: ${borderRadiusDefault};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: ${colorGlassBackgroundModal};
  text-align: center;

  animation: ${({ exiting }) =>
    exiting
      ? css`
          ${fadeOutUp} 0.25s forwards
        `
      : css`
          ${fadeInUp} 0.25s forwards
        `};
`;
